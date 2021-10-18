import { Dispositivo } from '../../../model/dispositivo/dispositivo';
import { buildListaElementosRenumerados, createElemento, getDispositivoFromElemento, getElementos } from '../../../model/elemento/elementoUtil';
import { DispositivoLexmlFactory } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { getAgrupadorAcimaByTipo, getDispositivoAnterior, hasAgrupadoresAcimaByTipo } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { Eventos } from '../../evento';
import { State, StateType } from '../../state';
import { normalizaSeForOmissis } from '../util/conteudoReducerUtil';
import { ajustaReferencia, copiaDispositivosParaAgrupadorPai, isDesdobramentoAgrupadorAtual, isDispositivoAlteracao, textoFoiModificado } from '../util/reducerUtil';
import { buildPast } from '../util/stateReducerUtil';

export const agrupaElemento = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    return state;
  }

  const dispositivoAnterior = getDispositivoAnterior(atual);
  const pos = atual.pai!.indexOf(atual);
  const removidos = atual
    .pai!.filhos.filter((f: Dispositivo, index: number) => index >= pos && f.tipo !== action.novo.tipo)
    .map(d => getElementos(d))
    .flat();

  if (textoFoiModificado(atual, action)) {
    atual.texto = !isDispositivoAlteracao(atual) ? action.atual.conteudo?.texto : normalizaSeForOmissis(action.atual.conteudo?.texto ?? '');
  }

  let novo;

  if (isDesdobramentoAgrupadorAtual(atual, action.novo.tipo)) {
    novo = DispositivoLexmlFactory.create(atual.pai!.pai!, action.novo.tipo, undefined, atual.pai!.pai!.indexOf(atual.pai!) + 1);
  } else if (hasAgrupadoresAcimaByTipo(atual, action.novo.tipo)) {
    const ref = getAgrupadorAcimaByTipo(atual, action.novo.tipo);
    novo = DispositivoLexmlFactory.create(ref!.pai!, action.novo.tipo, ref);
  } else {
    novo = DispositivoLexmlFactory.create(atual.pai!, action.novo.tipo, undefined, atual.pai!.indexOf(atual));
  }
  novo.texto = action.novo.conteudo?.texto;
  const dispositivos = atual.pai!.filhos.filter((f: Dispositivo, index: number) => index >= pos && f.tipo !== action.novo.tipo);
  copiaDispositivosParaAgrupadorPai(novo, dispositivos);
  novo.renumeraFilhos();
  novo.pai!.renumeraFilhos();

  const renumerados = [...buildListaElementosRenumerados(novo)].concat(
    novo.filhos
      .filter((f: Dispositivo, index: number) => index >= pos && f.tipo !== atual.tipo)
      .map((d: Dispositivo) => getElementos(d))
      .flat()
  );
  const eventos = new Eventos();
  eventos.setReferencia(createElemento(ajustaReferencia(dispositivoAnterior ?? atual.pai!, novo)));
  eventos.add(StateType.ElementoIncluido, getElementos(novo));
  eventos.add(StateType.ElementoRemovido, removidos);

  eventos.add(StateType.ElementoRenumerado, renumerados);

  return {
    articulacao: state.articulacao,
    past: buildPast(state, eventos.build()),
    present: eventos.build(),
    future: state.future,
    ui: {
      events: eventos.build(),
    },
  };
};

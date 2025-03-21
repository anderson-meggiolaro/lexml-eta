import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { isAgrupador, isOmissis } from '../../../model/dispositivo/tipo';
import { Elemento } from '../../../model/elemento';
import { createElemento, createElementos, getDispositivoFromElemento } from '../../../model/elemento/elementoUtil';
import { normalizaSeForOmissis } from '../../../model/lexml/conteudo/conteudoUtil';
import { createByInferencia } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { copiaFilhos } from '../../../model/lexml/dispositivo/dispositivoLexmlUtil';
import { hasFilhos, irmaosMesmoTipo, isArtigoUnico, isDispositivoAlteracao, isParagrafoUnico } from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { DispositivoAdicionado } from '../../../model/lexml/situacao/dispositivoAdicionado';
import { TipoMensagem } from '../../../model/lexml/util/mensagem';
import { State, StateType } from '../../state';
import { buildEventoAdicionarElemento } from '../evento/eventosUtil';
import { createElementoValidado, isNovoDispositivoDesmembrandoAtual, naoPodeCriarFilho, textoFoiModificado } from '../util/reducerUtil';
import { buildPast, retornaEstadoAtualComMensagem } from '../util/stateReducerUtil';

export const adicionaElemento = (state: any, action: any): State => {
  let textoModificado = false;

  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    return state;
  }

  if (atual.situacao?.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL && isNovoDispositivoDesmembrandoAtual(action.novo?.conteudo?.texto)) {
    action.atual.conteudo.texto = atual.texto;
    action.novo.conteudo.texto = undefined;
  }

  const originalmenteUnico = isArtigoUnico(atual) || isParagrafoUnico(atual);

  const elementoAtualOriginal = createElementoValidado(atual);

  const elementosRemovidos: Elemento[] = [];

  createElementos(elementosRemovidos, atual);

  if (textoFoiModificado(atual, action, state)) {
    atual.texto = !isDispositivoAlteracao(atual) ? action.atual.conteudo?.texto : normalizaSeForOmissis(action.atual.conteudo?.texto ?? '');
    textoModificado = true;
  }

  if (naoPodeCriarFilho(atual, action)) {
    return retornaEstadoAtualComMensagem(state, { tipo: TipoMensagem.INFO, descricao: 'Não é possível criar dispositivos nessa situação' });
  }

  const novo = createByInferencia(atual, action);

  if (
    atual.situacao?.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL ||
    atual.situacao?.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_MODIFICADO ||
    atual.situacao instanceof DispositivoAdicionado
  ) {
    novo.situacao = new DispositivoAdicionado();
  }

  if (isNovoDispositivoDesmembrandoAtual(action.novo?.conteudo?.texto) && atual.tipo === novo.tipo && hasFilhos(atual)) {
    copiaFilhos(atual, novo);
  }

  if (isDispositivoAlteracao(novo)) {
    novo.mensagens?.push({ tipo: TipoMensagem.WARNING, descricao: `É necessário informar o rótulo do dispositivo` });
  }

  novo.pai!.renumeraFilhos();

  const eventos = buildEventoAdicionarElemento(atual, novo);

  const elementoAtualAtualizado = createElementoValidado(atual);

  if (isNovoDispositivoDesmembrandoAtual(action.novo?.conteudo?.texto) && atual.tipo === novo.tipo && elementosRemovidos && elementosRemovidos.length > 0) {
    eventos.add(StateType.ElementoRemovido, elementosRemovidos);
  }

  if (isAgrupador(novo) && irmaosMesmoTipo(novo).length === 2) {
    const irmao = irmaosMesmoTipo(novo).filter(a => a !== novo);
    eventos.add(StateType.ElementoModificado, [createElemento(irmao[0]!)]);
  }

  if (textoModificado || isNovoDispositivoDesmembrandoAtual(action.novo?.conteudo?.texto)) {
    eventos.add(StateType.ElementoModificado, [elementoAtualOriginal, elementoAtualAtualizado]);
  }

  if (textoModificado || isNovoDispositivoDesmembrandoAtual(action.novo?.conteudo?.texto) || isOmissis(atual)) {
    eventos.add(StateType.ElementoValidado, [elementoAtualAtualizado]);
  }

  if (isArtigoUnico(atual) || originalmenteUnico) {
    eventos.add(StateType.ElementoValidado, [elementoAtualAtualizado]);
    eventos.add(StateType.ElementoRenumerado, [elementoAtualAtualizado]);
  }

  return {
    articulacao: state.articulacao,
    tipoDocumento: state.tipoDocumento,
    past: buildPast(state, eventos.build()),
    present: eventos.build(),
    future: state.future,

    ui: {
      events: eventos.build(),
    },
  };
};

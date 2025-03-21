import { Artigo, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { DescricaoSituacao } from '../../../model/dispositivo/situacao';
import { isAgrupador, isArticulacao, isArtigo, isDispositivoGenerico } from '../../../model/dispositivo/tipo';
import { Elemento } from '../../../model/elemento';
import { createElemento } from '../../../model/elemento/elementoUtil';
import { isAcaoPermitida } from '../../../model/lexml/acao/acaoUtil';
import { AdicionarElemento } from '../../../model/lexml/acao/adicionarElementoAction';
import { hasIndicativoDesdobramento } from '../../../model/lexml/conteudo/conteudoUtil';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import {
  getArticulacao,
  getDispositivoAndFilhosAsLista,
  getDispositivoAnteriorMesmoTipo,
  getProximoArtigoAnterior,
  getUltimoFilho,
  hasFilhos,
} from '../../../model/lexml/hierarquia/hierarquiaUtil';
import { Counter } from '../../../util/counter';
import { StateType } from '../../state';
import { getEvento } from '../evento/eventosUtil';

export const textoFoiModificado = (atual: Dispositivo, action: any, state?: any): boolean => {
  if (state && state.ui?.events) {
    const ev = getEvento(state.ui.events, StateType.ElementoModificado);
    if (ev && ev.elementos && ev.elementos[0]?.conteudo?.texto === atual.texto) {
      return true;
    }
  }
  return (atual.texto !== '' && action.atual?.conteudo?.texto === '') || (action.atual?.conteudo?.texto && atual.texto.localeCompare(action.atual?.conteudo?.texto) !== 0);
};

export const createElementoValidado = (dispositivo: Dispositivo): Elemento => {
  const el = createElemento(dispositivo);
  el.mensagens = validaDispositivo(dispositivo);

  return el;
};

export const resetUuidTodaArvore = (dispositivo: Dispositivo): void => {
  dispositivo.uuid = Counter.next();
  dispositivo.filhos?.forEach(f => resetUuidTodaArvore(f));
};

export const copiaDispositivosParaOutroPai = (pai: Dispositivo, dispositivos: Dispositivo[]): Dispositivo[] => {
  return dispositivos.map(d => {
    const paiAtual = d.pai;

    resetUuidTodaArvore(d);
    const anterior = isArtigo(d) ? getDispositivoAnteriorMesmoTipo(d) : undefined;
    paiAtual?.removeFilho(d);
    d.pai = pai;
    pai.addFilho(d, anterior);
    return d;
  });
};

const isPrimeiroArtigo = (dispositivo: Dispositivo): boolean => {
  return isArtigo(dispositivo) && getArticulacao(dispositivo).indexOfArtigo(dispositivo as Artigo) === 0;
};

export const isDesdobramentoAgrupadorAtual = (dispositivo: Dispositivo, tipo: string): boolean => {
  return dispositivo.pai!.tipo === tipo;
};

export const ajustaReferencia = (referencia: Dispositivo, dispositivo: Dispositivo): Dispositivo => {
  return isArticulacao(referencia) || isPrimeiroArtigo(dispositivo) || dispositivo.pai!.indexOf(dispositivo) === 0 ? referencia : getUltimoFilho(referencia);
};

export const naoPodeCriarFilho = (dispositivo: Dispositivo, action: any): boolean => {
  if (
    isAgrupador(dispositivo) &&
    dispositivo.pai &&
    dispositivo.situacao.descricaoSituacao !== DescricaoSituacao.DISPOSITIVO_NOVO &&
    !getProximoArtigoAnterior(dispositivo.pai!, dispositivo)
  ) {
    return true;
  }
  if (dispositivo.situacao.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL && hasIndicativoDesdobramento(dispositivo) && hasFilhos(dispositivo)) {
    return true;
  }
  return (
    isDispositivoGenerico(dispositivo) ||
    (hasIndicativoDesdobramento(dispositivo) && !isAcaoPermitida(dispositivo, AdicionarElemento)) ||
    (dispositivo.situacao?.descricaoSituacao === DescricaoSituacao.DISPOSITIVO_ORIGINAL && isNovoDispositivoDesmembrandoAtual(action.novo?.conteudo?.texto))
  );
};

export const isNovoDispositivoDesmembrandoAtual = (texto: string): boolean => {
  return texto !== undefined && texto !== '';
};

export const getElementosDoDispositivo = (dispositivo: Dispositivo, valida = false): Elemento[] => {
  const lista: Elemento[] = [];

  getDispositivoAndFilhosAsLista(dispositivo).forEach(d => {
    if (valida) {
      const mensagens = validaDispositivo(d);
      if (mensagens) {
        d.mensagens = mensagens;
        lista.push(createElemento(d));
      }
    } else {
      lista.push(createElemento(d));
    }
  });
  return lista;
};

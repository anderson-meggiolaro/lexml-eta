import { Artigo, Dispositivo } from '../../../model/dispositivo/dispositivo';
import { isArticulacao, isArtigo } from '../../../model/dispositivo/tipo';
import { Elemento } from '../../../model/elemento';
import { createElemento } from '../../../model/elemento/elementoUtil';
import { acoesPossiveis } from '../../../model/lexml/acoes/acoesPossiveis';
import { AdicionarElemento } from '../../../model/lexml/acoes/adicionarElementoAction';
import { hasIndicativoDesdobramento } from '../../../model/lexml/conteudo/conteudoUtil';
import { DispositivoLexmlFactory } from '../../../model/lexml/dispositivo/dispositivoLexmlFactory';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivoValidator';
import { getArticulacao, getDispositivoAndFilhosAsLista, getDispositivoAnteriorMesmoTipo, getUltimoFilho } from '../../../model/lexml/hierarquia/hierarquiaUtil';
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

export const copiaDispositivosParaAgrupadorPai = (pai: Dispositivo, dispositivos: Dispositivo[]): Dispositivo[] => {
  return dispositivos.map(d => {
    const anterior = isArtigo(d) ? getDispositivoAnteriorMesmoTipo(d) : undefined;
    const novo = DispositivoLexmlFactory.create(pai, d.tipo, anterior);
    novo.texto = d.texto;
    novo.numero = d.numero;
    novo.rotulo = d.rotulo;
    novo.mensagens = d.mensagens;
    DispositivoLexmlFactory.copiaFilhos(d, novo);

    d.pai!.removeFilho(d);
    return novo;
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

export const naoPodeCriarFilho = (dispositivo: Dispositivo): boolean => {
  return hasIndicativoDesdobramento(dispositivo) && acoesPossiveis(dispositivo).filter(a => a instanceof AdicionarElemento).length === -1;
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

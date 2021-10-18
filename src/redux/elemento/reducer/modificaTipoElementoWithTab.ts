import { getDispositivoFromElemento } from '../../../model/elemento/elemento-util';
import { getAcaoPossivelShiftTab, getAcaoPossivelTab } from '../../../model/lexml/acoes/acoes-possiveis';
import { State } from '../../state';
import { TAB, TransformarElemento, TRANSFORMAR_TIPO_ELEMENTO } from '../action/elementoActions';
import { transformaTipoElemento } from './transformaTipoElemento';

export const modificaTipoElementoWithTab = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    return state;
  }
  const acao = action.type === TAB ? getAcaoPossivelTab(atual) : getAcaoPossivelShiftTab(atual);

  if (!acao) {
    return state;
  }

  const newAction = {
    type: TRANSFORMAR_TIPO_ELEMENTO,
    subType: (acao as TransformarElemento).nomeAcao,
    atual: action.atual,
    novo: {
      tipo: acao.tipo,
    },
  };

  return transformaTipoElemento(state, newAction);
};

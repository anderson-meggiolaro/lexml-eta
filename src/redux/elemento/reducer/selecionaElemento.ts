import { createElemento, getDispositivoFromElemento } from '../../../model/elemento/elemento-util';
import { validaDispositivo } from '../../../model/lexml/dispositivo/dispositivo-validator';
import { State, StateType } from '../../state';

export const selecionaElemento = (state: any, action: any): State => {
  const atual = getDispositivoFromElemento(state.articulacao, action.atual, true);

  if (atual === undefined) {
    return state;
  }
  atual.mensagens = validaDispositivo(atual);
  const elemento = createElemento(atual, true);

  const events = [
    {
      stateType: StateType.ElementoSelecionado,
      elementos: [elemento],
    },
  ];

  return {
    articulacao: state.articulacao,
    past: state.past,
    present: state.present,
    future: state.future,
    ui: {
      events,
    },
  };
};

import { Elemento } from '../../../model/elemento';
import { validaFilhos } from '../../../model/elemento/elementoUtil';
import { State, StateType } from '../../state';

export const validaArticulacao = (state: any): State => {
  const elementos: Elemento[] = [];
  validaFilhos(elementos, state.articulacao.filhos);

  const events = [
    {
      stateType: StateType.ElementoValidado,
      elementos: elementos,
    },
  ];

  return {
    articulacao: state.articulacao,
    tipoDocumento: state.tipoDocumento,
    past: state.past,
    present: state.present,
    future: state.future,
    ui: {
      events,
    },
  };
};

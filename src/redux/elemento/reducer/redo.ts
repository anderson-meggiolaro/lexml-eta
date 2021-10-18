import { Eventos, getEvento } from '../../evento';
import { State, StateType } from '../../state';
import { buildPast } from '../util/stateReducerUtil';
import { incluir, processaRenumerados, processarModificados, processaValidados, remover } from '../util/undoRedoReducerUtil';

export const redo = (state: any): State => {
  if (state.future === undefined || state.future.length === 0) {
    return state;
  }

  const eventos = state.future.pop();

  const retorno: State = {
    articulacao: state.articulacao,
    past: buildPast(state, eventos),
    present: [],
    future: state.future,
    ui: {
      events: [],
    },
  };

  const events = new Eventos();

  events.add(StateType.ElementoRemovido, remover(state, getEvento(eventos, StateType.ElementoRemovido)));
  events.add(StateType.ElementoIncluido, incluir(state, getEvento(eventos, StateType.ElementoIncluido), getEvento(events.eventos, StateType.ElementoIncluido)));
  events.add(StateType.ElementoModificado, processarModificados(state, getEvento(eventos, StateType.ElementoModificado), true));
  events.add(StateType.ElementoRenumerado, processaRenumerados(state, getEvento(eventos, StateType.ElementoRenumerado)));
  events.add(StateType.ElementoValidado, processaValidados(state, eventos));

  retorno.ui!.events = events.build();
  retorno.present = events.build();

  return retorno;
};

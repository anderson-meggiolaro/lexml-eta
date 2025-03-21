import { ElementoAction } from '.';
import { Referencia } from '../../elemento';

export const RESTAURAR_ELEMENTO = 'RESTAURAR_ELEMENTO';

class RestaurarElemento implements ElementoAction {
  descricao: string;
  tipo?: string;

  constructor() {
    this.descricao = 'Abandonar modificações do dispositivo';
  }

  execute(atual: Referencia): any {
    return {
      type: RESTAURAR_ELEMENTO,
      atual,
    };
  }
}
export const restaurarElementoAction = new RestaurarElemento();

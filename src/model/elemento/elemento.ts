import { Conteudo } from '../dispositivo/conteudo';
import { ElementoAction } from '../lexml/acao';
import { Mensagem } from '../lexml/util/mensagem';

export class Referencia {
  tipo?: string;
  uuid?: number;
  conteudo?: Partial<Conteudo>;
  descricaoSituacao?: string;
  uuidAlteracao?: number;
}
export class Elemento extends Referencia {
  nivel = 0;
  numero?: string;
  rotulo = '';
  agrupador = false;
  editavel = true;
  mensagens?: Mensagem[];
  hierarquia?: {
    pai?: Referencia;
    posicao?: number;
    numero?: string;
  };
  sendoEditado = false;
  index = 0;
  acoesPossiveis?: ElementoAction[];
}

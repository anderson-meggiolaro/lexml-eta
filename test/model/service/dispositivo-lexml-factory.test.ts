import { expect } from '@open-wc/testing';
import { Articulacao, Artigo, Dispositivo } from '../../../src/model/dispositivo/dispositivo';
import { createArticulacao, criaDispositivo } from '../../../src/model/lexml/dispositivo/dispositivoLexmlFactory';
import { TipoDispositivo } from '../../../src/model/lexml/tipo/tipoDispositivo';

let articulacao: Articulacao;
let secao: Dispositivo;
let artigo: Artigo;

describe('DispositivoLexmlFactory', () => {
  beforeEach(function () {
    articulacao = createArticulacao();
    secao = criaDispositivo(articulacao, TipoDispositivo.secao.tipo);
    artigo = criaDispositivo(secao, TipoDispositivo.artigo.tipo) as Artigo;
  });
  describe('Testando a inicialização dos dispositivos', () => {
    it('Quando informada uma tag válida, cria um dispositivo correspondente à tag', () => {
      expect(artigo.tipo).to.be.equal(TipoDispositivo.artigo.tipo);
    });
    it('Quando informada uma tag inválida, cria um dispositivo genérico', () => {
      const novo = criaDispositivo(secao, 'artigulo') as Artigo;
      expect(novo.tipo).to.be.equal(TipoDispositivo.agrupadorGenerico.tipo);
    });
  });
  describe('Testando a hierarquia dos dispositivos', () => {
    it('cria um dispositivo com referência ao pai que também tem referência ao Filho quando informado um parent', () => {
      const paragrafo = criaDispositivo(artigo, TipoDispositivo.paragrafo.tipo);
      expect(artigo.filhos?.includes(paragrafo)).to.be.true;
      expect(paragrafo.pai).to.be.equal(artigo);
    });
  });
});

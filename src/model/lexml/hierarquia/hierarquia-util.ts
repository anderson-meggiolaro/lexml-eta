import { Articulacao, Artigo, Dispositivo } from '../../dispositivo/dispositivo';
import { isAgrupador, isArticulacao, isArtigo, isDispositivoGenerico, isParagrafo, Tipo } from '../../dispositivo/tipo';

export function getArticulacao(dispositivo: Dispositivo): Articulacao {
  if (isArticulacao(dispositivo)) {
    return dispositivo as Articulacao;
  }
  if (dispositivo.pai === undefined) {
    throw new Error('Não foi encontrada a articulação');
  }
  return getArticulacao(dispositivo.pai);
}

export function getDispositivo(uuid: number, dispositivo: Dispositivo | Articulacao): Dispositivo | Articulacao | null {
  if (dispositivo.uuid === uuid) {
    return dispositivo;
  } else if (dispositivo.filhos !== null) {
    let i;
    let result = null;

    for (i = 0; result === null && i < dispositivo.filhos.length; i++) {
      result = getDispositivo(uuid, dispositivo.filhos[i]);
    }
    return result;
  }
  return null;
}

export const findDispositivoById = (articulacao: Articulacao, uuid: number): Dispositivo | null => {
  if (uuid === undefined) {
    throw new Error('uuid não foi informado');
  }

  return getDispositivo(uuid, articulacao);
};

export const getUltimoFilho = (dispositivo: Dispositivo): Dispositivo => {
  if (dispositivo.filhos.length === 0) {
    return dispositivo;
  }

  const ultimoFilho = dispositivo.filhos[dispositivo.filhos.length - 1];

  return ultimoFilho!.filhos.length === 0 ? ultimoFilho : getUltimoFilho(ultimoFilho);
};

export const irmaosMesmoTipo = (dispositivo: Dispositivo): Dispositivo[] => {
  return isArtigo(dispositivo) ? getArticulacao(dispositivo).artigos.filter(f => f.tipo === dispositivo.tipo) : dispositivo.pai!.filhos.filter(f => f.tipo === dispositivo.tipo);
};

export const getAgrupadoresPosterioresTipoAcima = (dispositivo: Dispositivo, tipo: Tipo): Dispositivo[] => {
  const pos = dispositivo.pai!.indexOf(dispositivo);
  return dispositivo.pai!.filhos.filter((d, i) => i > pos && isAgrupador(d) && dispositivo.tiposPermitidosPai!.indexOf(tipo.tipo) > 0);
};

export const getAgrupadoresAcima = (pai: Dispositivo, referencia: Dispositivo, agrupadores: Dispositivo[]): Dispositivo[] => {
  if (pai?.filhos) {
    for (let i = pai?.indexOf(referencia); i >= 0; i--) {
      const d = pai?.filhos[i];
      if (isAgrupador(d)) {
        agrupadores.push(d);
      }
    }
    if (pai?.pai) {
      return getAgrupadoresAcima(pai.pai, referencia.pai!, agrupadores);
    }
  }
  return agrupadores;
};

export const hasAgrupadoresAcima = (dispositivo: Dispositivo): boolean => {
  const agrupadores: Dispositivo[] = [];
  if (dispositivo.pai?.pai === undefined) {
    return false;
  }

  return getAgrupadoresAcima(dispositivo.pai!.pai!, dispositivo.pai, agrupadores).length > 0;
};

export const getAgrupadorAcimaByTipo = (referencia: Dispositivo, tipo: string): Dispositivo | undefined => {
  return [...new Set(getAgrupadoresAcima(referencia.pai!, referencia, []))].filter(a => a.tipo === tipo).reverse()[0];
};

export const hasAgrupadoresAcimaByTipo = (dispositivo: Dispositivo, tipo: string): boolean => {
  return getAgrupadoresAcima(dispositivo.pai!.pai!, dispositivo.pai!, []).filter(d => d.tipo === tipo).length > 0;
};

export const getArtigo = (dispositivo: Dispositivo): Dispositivo => {
  if (isArtigo(dispositivo.pai!)) {
    return dispositivo.pai!;
  }
  return getArtigo(dispositivo.pai!);
};

export const getProximoArtigoAnterior = (pai: Dispositivo, referencia: Dispositivo): Dispositivo | undefined => {
  if (pai?.filhos) {
    for (let i = pai?.indexOf(referencia) - 1; i >= 0; i--) {
      const d = pai?.filhos[i];
      if (isArtigo(d)) {
        return d;
      }
      if (isAgrupador(d)) {
        return buscaArtigoAnteriorAbaixo(d);
      }
    }
    if (pai?.pai) {
      return getProximoArtigoAnterior(pai.pai, referencia.pai!);
    }
  }
  return undefined;
};

const buscaArtigoAnteriorAbaixo = (dispositivo: Dispositivo): Dispositivo | undefined => {
  if (dispositivo === undefined) {
    return undefined;
  }

  if (dispositivo.filhos) {
    for (let i = dispositivo.filhos.length - 1; i >= 0; i--) {
      const d = dispositivo.filhos[i];
      if (isArtigo(d)) {
        return d;
      }
      if (isAgrupador(d)) {
        return buscaArtigoAnteriorAbaixo(d);
      }
    }
  }
  return undefined;
};

export const getAgrupadorPosterior = (dispositivo: Dispositivo): Dispositivo => {
  const pos = dispositivo.pai!.indexOf(dispositivo);
  return dispositivo.pai!.filhos.filter((d, i) => i > pos && isAgrupador(d))[0];
};

export const hasAgrupadoresPosteriores = (dispositivo: Dispositivo): boolean => {
  const pos = dispositivo.pai!.indexOf(dispositivo);
  return dispositivo.pai!.filhos.filter((d, i) => i > pos && isAgrupador(d)).length > 0;
};

export const hasFilhoGenerico = (dispositivo: Dispositivo): boolean => {
  return dispositivo.filhos?.filter(d => isDispositivoGenerico(d)).length > 0;
};

export const isUnicoMesmoTipo = (dispositivo: Dispositivo): boolean => {
  const f = irmaosMesmoTipo(dispositivo);
  return f.length === 1;
};

export const isUltimoMesmoTipo = (dispositivo: Dispositivo): boolean => {
  const f = irmaosMesmoTipo(dispositivo);
  return f[f.length - 1] === dispositivo;
};

export const isPenultimoMesmoTipo = (dispositivo: Dispositivo): boolean => {
  const f = irmaosMesmoTipo(dispositivo);
  return f.length > 1 && f[f.length - 2] === dispositivo;
};

export const isPrimeiroMesmoTipo = (dispositivo: Dispositivo): boolean => {
  const f = irmaosMesmoTipo(dispositivo);
  return f[0] === dispositivo;
};

export const hasFilhos = (dispositivo: Dispositivo): boolean => {
  return dispositivo.filhos && dispositivo.filhos.length > 0;
};

export const getDispositivoAnterior = (dispositivo: Dispositivo): Dispositivo | undefined => {
  const pos = dispositivo.pai!.indexOf(dispositivo);
  return pos > 0 ? dispositivo.pai!.filhos[pos - 1] : undefined;
};

export const getDispositivoAnteriorMesmoTipo = (dispositivo: Dispositivo): Dispositivo | undefined => {
  const irmaos = irmaosMesmoTipo(dispositivo);
  const pos = irmaos.indexOf(dispositivo);
  return pos > 0 ? irmaos[pos - 1] : undefined;
};

export const getDispositivoAnteriorMesmoTipoInclusiveOmissis = (dispositivo: Dispositivo): Dispositivo | undefined => {
  const pos = dispositivo.pai!.indexOf(dispositivo);

  if (pos === 0) {
    return undefined;
  }

  const irmaos = dispositivo.pai!.filhos.filter((f, index) => index < pos && f.pai === dispositivo.pai);
  return irmaos.pop();
};

export const getDispositivoPosterior = (dispositivo: Dispositivo): Dispositivo | undefined => {
  const pos = dispositivo.pai!.indexOf(dispositivo);
  return pos < dispositivo.pai!.filhos.length - 1 ? dispositivo.pai!.filhos[pos + 1] : undefined;
};

export const getDispositivoPosteriorMesmoTipo = (dispositivo: Dispositivo): Dispositivo | undefined => {
  const irmaos = irmaosMesmoTipo(dispositivo);
  const pos = irmaos.indexOf(dispositivo);
  return pos < irmaos.length - 1 ? dispositivo.pai!.filhos[pos + 1] : undefined;
};

export const getDispositivosPosterioresMesmoTipo = (dispositivo: Dispositivo): Dispositivo[] => {
  const pos = dispositivo.pai!.indexOf(dispositivo);
  return dispositivo.pai!.filhos.filter((f, index) => index > pos && f.tipo === dispositivo.tipo);
};

export const getDispositivoPosteriorMesmoTipoInclusiveOmissis = (dispositivo: Dispositivo): Dispositivo | undefined => {
  const pos = dispositivo.pai!.indexOf(dispositivo);

  if (pos === dispositivo.pai!.filhos.length - 1) {
    return undefined;
  }

  const irmaos = dispositivo.pai!.filhos.filter((f, index) => index > pos && f.pai === dispositivo.pai);
  return irmaos[0];
};

export const getDispositivosPosteriores = (dispositivo: Dispositivo, isExclusao = false): Dispositivo[] => {
  if (isArtigo(dispositivo)) {
    const articulacao = getArticulacao(dispositivo);
    const pos = getArticulacao(dispositivo).indexOfArtigo(dispositivo as Artigo);
    return articulacao.artigos.filter((artigo, index) => index > pos);
  }
  const pos = dispositivo.pai!.indexOf(dispositivo);
  return dispositivo.pai!.filhos.filter((disp, index) => (isExclusao ? index > pos : index >= pos)).filter(d => dispositivo.tipo === d.tipo);
};

export const getFilhosDispositivoAsLista = (dispositivos: Dispositivo[], filhos: Dispositivo[]): void => {
  filhos?.forEach(f => {
    dispositivos.push(f);
    if (hasFilhos(f)) {
      getFilhosDispositivoAsLista(dispositivos, f.filhos);
    }
    if (f.hasAlteracao()) {
      f.alteracoes?.filhos.forEach(a => getFilhosDispositivoAsLista(dispositivos, a.filhos));
    }
  });
};

export const getDispositivoAndFilhosAsLista = (dispositivo: Dispositivo): Dispositivo[] => {
  const lista: Dispositivo[] = [];

  lista.push(dispositivo);
  getFilhosDispositivoAsLista(lista, dispositivo.filhos);

  return lista;
};

export const isArtigoUnico = (dispositivo: Dispositivo): boolean => {
  return isArtigo(dispositivo) && isUnicoMesmoTipo(dispositivo);
};

export const isParagrafoUnico = (dispositivo: Dispositivo): boolean => {
  return isParagrafo(dispositivo) && isUnicoMesmoTipo(dispositivo);
};

export const getDispositivoCabecaAlteracao = (dispositivo: Dispositivo): Dispositivo => {
  return isDispositivoCabecaAlteracao(dispositivo) ? dispositivo : getDispositivoCabecaAlteracao(dispositivo.pai!);
};

export const isDispositivoCabecaAlteracao = (dispositivo: Dispositivo): boolean => {
  return isArticulacao(dispositivo.pai!) && dispositivo.pai!.pai !== undefined;
};

export const isUltimaAlteracao = (dispositivo: Dispositivo): boolean => {
  const lista: Dispositivo[] = [];
  const atual = getDispositivoCabecaAlteracao(dispositivo);
  lista.push(atual);
  getFilhosDispositivoAsLista(lista, atual.filhos);

  return lista.length > 0 && lista[lista.length - 1] === dispositivo;
};

export const hasDispositivosPosterioresAlteracao = (dispositivo: Dispositivo): boolean => {
  const atual = getArticulacao(dispositivo).pai;

  if (!atual) {
    return false;
  }

  const articulacao = getArticulacao(atual!);

  return articulacao.indexOfArtigo(atual) === articulacao.artigos.length - 1;
};

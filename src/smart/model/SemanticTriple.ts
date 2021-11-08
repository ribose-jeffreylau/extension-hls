export type STNode = {
  data: string;
  relationship: STRelation[];
};

export type STRelation = {
  relationship: string;
  connect: string;
};

export const RDFVersion = '0.0.1';

export type ProvisionRDF = {
  // roots[provision.id]
  roots: Record<string, string[]>;
  nodes: Record<string, STNode>;
  version: typeof RDFVersion;
};

export type NLPJSON = {
  sentences: NLPItem[];
};

export type NLPItem = {
  enhancedPlusPlusDependencies: NLPDependency[];
  tokens: NLPToken[];
};

export type NLPDependency = {
  dep: string;
  dependent: number;
  governor: number;
};

export type NLPToken = {
  word: string;
  lemma: string;
};

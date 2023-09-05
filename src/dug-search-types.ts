/* eslint-disable prettier/prettier */

type APIError = {
  detail: Array<{
    loc: [string, number],
    msg: string,
    type: string,
  }>
}

export type ConceptsResponseSuccess = {
  message: string,
  result: {
    docs: Array<{
      _source: {
        id: string,
        name: string,
        description: string,
        type: string,
        search_terms: string[],
        optional_terms: string[],
        concept_action: string,
        identifiers: Array<{
          id: string,
          label: string,
          equivalent_identifiers: string[],
          type: string,
          synonyms: string[],
        }>,
      },
    }>,
  },
  status: string,
}

export type StudiesResponseSuccess = {
  message: string,
  result: Array<{
    c_id: string,
    c_link: string,
    c_name: string,
  }>,
  status:  string,
}

export type VariablesResponseSuccess = {
  message: string,
  result: {
    docs: Array<{
      _source: {
        element_id: string,
        element_name: string,
        element_desc: string,
        search_terms: string[],
        optional_terms: any[],
        collection_id: string,
        collection_name: string,
        collection_desc: string,
        element_action: string,
        collection_action: string,
        data_type: string,
        identifiers: string[],
      },
    }>,
  },
  status:  string,
}

export type ConceptsResponse = ConceptsResponseSuccess | APIError;
export type StudiesResponse = StudiesResponseSuccess | APIError;
export type VariablesResponse = VariablesResponseSuccess | APIError;
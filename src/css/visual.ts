import { css, SerializedStyles } from '@emotion/react';
import {
  MapCoverType,
  MappingResultStyles,
  MappingSourceStyles,
  MapSourceType,
} from '../smart/utils/MappingCalculator';
import {
  SearchHighlightType,
  SearchResultStyles,
} from '../smart/utils/SearchFunctions';

export const handlecss = css`
  border-radius: '5px!important',
  width: '19px!important',
  height: '19px!important',
  background: 'whitesmoke!important',
  border: '1px solid black!important',
`;

export const no_highlight = css``;

export function map_style__coverage(result: MapCoverType): SerializedStyles {
  return flow_node__highlighed(MappingResultStyles[result].color);
}

export function map_style__source(result: MapSourceType): SerializedStyles {
  return flow_node__highlighed(MappingSourceStyles[result].color);
}

export function search_style__highlight(
  result: SearchHighlightType
): SerializedStyles {
  if (result !== SearchHighlightType.NONE) {
    return flow_node__highlighed(SearchResultStyles[result].color);
  } else {
    return no_highlight;
  }
}

export function flow_node__highlighed(color: string) {
  return css`
    background-color: ${color};
  `;
}
/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Switch } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import {
  MMELVariable,
  MMELView,
  VarType,
} from '../../serialize/interface/supportinterface';
import { NormalTextField } from '../common/fields';

function getDesc(v: MMELVariable) {
  return (
    v.description +
    (v.type === VarType.LISTDATA ? ' (Seperate the values by ,)' : '')
  );
}

const VariableSettingItem: React.FC<{
  variable: MMELVariable;
  value?: string;
  profile: MMELView | undefined;
  onChange: (v: string) => void;
  branchOnly: boolean;
}> = function ({ variable, value, profile, branchOnly, onChange }) {
  return (
    <div
      style={
        profile !== undefined && profile.profile[variable.id] !== undefined
          ? {
              borderStyle: 'solid',
            }
          : {}
      }
    >
      {variable.type === VarType.BOOLEAN ? (
        <Switch
          key={(branchOnly ? 'view' : 'measurment') + variable.id}
          checked={value !== undefined ? value === 'true' : true}
          label={getDesc(variable)}
          onChange={
            profile !== undefined &&
            profile.profile[variable.id] !== undefined &&
            profile.profile[variable.id].isConst
              ? undefined
              : x => onChange(x.currentTarget.checked ? 'true' : 'false')
          }
        />
      ) : (
        <NormalTextField
          key={(branchOnly ? 'view' : 'measurment') + variable.id}
          text={getDesc(variable)}
          value={value ?? ''}
          onChange={
            profile !== undefined &&
            profile.profile[variable.id] !== undefined &&
            profile.profile[variable.id].isConst
              ? undefined
              : onChange
          }
        />
      )}
    </div>
  );
};

export default VariableSettingItem;

/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { Menu, MenuItem } from '@blueprintjs/core';

const EditorFileMenu: React.FC<{
  undo?: () => void;
  redo?: () => void;
}> = function ({ undo, redo }) {
  return (
    <Menu>
      <MenuItem
        text="Undo"
        label="Ctrl + Z"
        disabled={undo === undefined}
        onClick={undo}
      />
      <MenuItem
        text="Redo"
        label="Ctrl + Y"
        disabled={redo === undefined}
        onClick={redo}
      />
    </Menu>
  );
};

export default EditorFileMenu;
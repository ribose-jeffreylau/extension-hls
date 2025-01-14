/** @jsx jsx */
/** @jsxFrag React.Fragment */

/**
 * It is the UI in the editor, for accessing the model settings
 */

import { jsx } from '@emotion/react';
import { Tab, Tabs } from '@blueprintjs/core';
import React, { useState } from 'react';
import { mgd_label } from '../../../css/form';
import {
  mgd_tabs__item,
  mgd_tabs__item__selected,
  mgd_tabs__item__unselected,
} from '../../../css/MGDTabs';
import MGDDisplayPane from '../../MGDComponents/MGDDisplayPane';
import { EditorModel } from '../../model/editormodel';
import DataClassEditPage from '../edit/dataclassedit';
import EnumEditPage from '../edit/enumedit';
import FigureEditPage from '../edit/figure/FigureEdit';
import MeasurementEditPage from '../edit/measurementedit';
import MetaEditPage from '../edit/metaedit';
import ReferenceEditPage from '../edit/refedit';
import RegistryEditPage from '../edit/registryedit';
import RoleEditPage from '../edit/roleedit';
import SectionEditPage from '../edit/SectionEditPage';
import TableEditPage from '../edit/table/TableEdit';
import TermsEditPage from '../edit/TermEdit';
import ViewProfileEditPage from '../edit/ViewProfileEdit';
import { EditorAction } from '../../model/editor/state';

export enum SETTINGPAGE {
  METAPAGE = 'meta',
  ROLEPAGE = 'role',
  REFPAGE = 'ref',
  REGISTRYPAGE = 'reg',
  DATAPAGE = 'dc',
  ENUMPAGE = 'enum',
  MEASUREMENT = 'measure',
  PROFILE = 'profile',
  TERMPAGE = 'terms',
  TABLEPAGE = 'table',
  FIGUREPAGE = 'figure',
  SECTION = 'section',
}

interface Props {
  model: EditorModel;
  act: (x: EditorAction) => void;
}

interface TabProps {
  title: string;
  Panel: React.FC<Props>;
}

const tabs: Record<SETTINGPAGE, TabProps> = {
  [SETTINGPAGE.METAPAGE] : {
    title : 'Metadata',
    Panel : ({ model, act }: Props) => <MetaEditPage meta={model.meta} act={act} />,
  },
  [SETTINGPAGE.SECTION] : {
    title : 'Sections',
    Panel : ({ model, act }: Props) => <SectionEditPage model={model} act={act} />,
  },
  [SETTINGPAGE.TERMPAGE] : {
    title : 'Terms',
    Panel : ({ model, act }: Props) => <TermsEditPage model={model} act={act} />,
  },
  [SETTINGPAGE.ROLEPAGE] : {
    title : 'Roles',
    Panel : ({ model, act }: Props) => <RoleEditPage model={model} act={act} />,
  },
  [SETTINGPAGE.REFPAGE] : {
    title : 'References',
    Panel : ({ model, act }: Props) => <ReferenceEditPage model={model} act={act} />,
  },
  [SETTINGPAGE.REGISTRYPAGE] : {
    title : 'Data Registry',
    Panel : ({ model, act }: Props) => <RegistryEditPage model={model} act={act} />,
  },
  [SETTINGPAGE.DATAPAGE] : {
    title : 'Data structure',
    Panel : ({ model, act }: Props) => <DataClassEditPage model={model} act={act} />,
  },
  [SETTINGPAGE.ENUMPAGE] : {
    title : 'Enumeration',
    Panel : ({ model, act }: Props) => <EnumEditPage model={model} act={act} />,
  },
  [SETTINGPAGE.MEASUREMENT] : {
    title : 'Measurement',
    Panel : ({ model, act }: Props) => <MeasurementEditPage model={model} act={act} />,
  },
  [SETTINGPAGE.PROFILE] : {
    title : 'View profiles',
    Panel : ({ model, act }: Props) => <ViewProfileEditPage model={model} act={act} />,
  },
  [SETTINGPAGE.TABLEPAGE] : {
    title : 'Tables',
    Panel : ({ model, act }: Props) => <TableEditPage model={model} act={act} />,
  },
  [SETTINGPAGE.FIGUREPAGE] : {
    title : 'Multimedia',
    Panel : ({ model, act }: Props) => <FigureEditPage model={model} act={act} />,
  },
};

function isTabProps(stuff: TabProps): stuff is TabProps {
  return true;
}


const BasicSettingPane: React.FC<{
  model: EditorModel;
  act: (x: EditorAction) => void;
}> = ({ model, act }) => {
  const [page, setPage] = useState<SETTINGPAGE>(SETTINGPAGE.METAPAGE);

  const tabElements: JSX.Element[] = [];
  for (const key of typeof tabs) {
    const props: TabProps = tabs[key as SETTINGPAGE];
    if (isTabProps(props)) {
      tabElements.push(
        <Tab
          key={key}
          id={key}
          title={
            <span
              css={[
                mgd_tabs__item,
                key === page
                  ? mgd_tabs__item__selected
                  : mgd_tabs__item__unselected
              ]}
            >
              <label css={mgd_label}> {props.title} </label>
            </span>
          }
          panel={<props.Panel model={model} act={act} />}
        />);
    }
  }

  return (
    <MGDDisplayPane>
      <Tabs
        key={jsx.length}
        onChange={x => setPage(x as SETTINGPAGE)}
        selectedTabId={page}
        animate={false}
      >
        {tabElements}
      </Tabs>
    </MGDDisplayPane>
  );
}

export default BasicSettingPane;

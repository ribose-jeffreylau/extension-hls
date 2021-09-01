/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { useContext, useMemo, useState } from 'react';

import ReactFlow, {
  Controls,
  OnLoadParams,
  ReactFlowProvider,  
} from 'react-flow-renderer';

import { ControlGroup } from '@blueprintjs/core';
import makeSidebar from '@riboseinc/paneron-extension-kit/widgets/Sidebar';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';

import {
  createEditorModelWrapper,
  getReactFlowElementsFrom,
  ModelWrapper,
} from '../model/modelwrapper';
import {
  addToHistory,
  createPageHistory,
  getBreadcrumbs,
  PageHistory,
  popPage,
} from '../model/history';
import {
  createNewEditorModel,  
} from '../utils/EditorFactory';
import { EdgeTypes, EditorState, NodeTypes } from '../model/state';
import { SelectedNodeDescription } from './sidebar/selected';
import MGDButton from '../MGDComponents/MGDButton';
import { MGDButtonType } from '../../css/MGDButton';
import {
  react_flow_container_layout,
  sidebar_layout,
} from '../../css/layout';
import { DataVisibilityButton } from './control/buttons';
import SearchComponentPane from './sidebar/search';
import {
  getHighlightedStyleById,
  getHighlightedSVGColorById,
} from '../utils/SearchFunctions';
import { handleModelOpen } from '../utils/IOFunctions';
import { SidebarBlockConfig } from '@riboseinc/paneron-extension-kit/widgets/Sidebar/Block';
import { Popover2 } from '@blueprintjs/popover2';
import ViewToolMenu from './menu/ViewToolMenu';

const initModel = createNewEditorModel();
const initModelWrapper = createEditorModelWrapper(initModel);

export enum FunctionPage {
  Simulation = 'simulation',
  Measurement = 'measurement',
  Filter = 'filter',
  Checklist = 'checklist'
}

export const FuntionNames: Record<FunctionPage, string> = {
  [FunctionPage.Simulation]: 'Simulation',    
  [FunctionPage.Measurement]: 'Measurement validation',    
  [FunctionPage.Filter]: 'Filtering',    
  [FunctionPage.Checklist]: 'Self-assessment checklist'    
}

const FunPages: Record<FunctionPage, SidebarBlockConfig> = {
  [FunctionPage.Simulation]: {
    key: 'simulation',
    title: FuntionNames[FunctionPage.Simulation],
    collapsedByDefault: false,
    content: (
      <>Simulation</>
    )
    
  },
  [FunctionPage.Measurement]: {
    key: 'measurement',
    title: FuntionNames[FunctionPage.Measurement],
    collapsedByDefault: false,
    content: (
      <>Measurement</>
    )
  },
  [FunctionPage.Filter]: {
    key: 'filter',
    title: FuntionNames[FunctionPage.Filter],
    collapsedByDefault: false,
    content: (
      <>Filter</>
    )
  },
  [FunctionPage.Checklist]: {
    key: 'checklist',
    title: FuntionNames[FunctionPage.Checklist],
    collapsedByDefault: false,
    content: (
      <>Checklist</>
    )
  },
}

const ModelViewer: React.FC<{
  isVisible: boolean;
  className?: string;
}> = ({ isVisible, className }) => {
  const { logger, useDecodedBlob, requestFileFromFilesystem } = useContext(DatasetContext);

  const { usePersistentDatasetStateReducer } = useContext(DatasetContext);

  const Sidebar = useMemo(
    () => makeSidebar(usePersistentDatasetStateReducer!),
    []
  );

  const [state, setState] = useState<EditorState>({
    dvisible: true,
    modelWrapper: initModelWrapper,
    history: createPageHistory(initModelWrapper),
    edgeDeleteVisible: false,
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<Set<string>>(
    new Set<string>()
  );
  const [funPage, setFunPage] = useState<FunctionPage>(FunctionPage.Measurement);

  function onLoad(params: OnLoadParams) {
    logger?.log('flow loaded');    
    params.fitView();
  }

  function toggleDataVisibility() {    
    setState({ ...state, dvisible: !state.dvisible });
  }

  function setModelWrapper(mw: ModelWrapper) {
    setState({ ...state, history: createPageHistory(mw), modelWrapper: mw });
  }

  function onPageChange(updated: PageHistory, newPage: string) {    
    state.history = updated;
    state.modelWrapper.page = newPage;
    setState({ ...state });
  }

  function onProcessClick(pageid: string, processid: string): void {    
    const mw = state.modelWrapper;
    mw.page = pageid;
    logger?.log('Go to page', pageid);
    addToHistory(state.history, mw.page, processid);
    setState({ ...state });
  }

  function drillUp(): void {
    if (state.history.items.length > 0) {      
      state.modelWrapper.page = popPage(state.history);
      setState({ ...state });
    }
  }

  function onPageAndHistroyChange(
    selected: string,
    pageid: string,
    history: PageHistory
  ) {
    setSelected(selected);
    setState({
      ...state,
      history,
      modelWrapper: { ...state.modelWrapper, page: pageid },
    });
  }

  function getStyleById(id: string) {
    return getHighlightedStyleById(id, selected, searchResult);
  }

  function getSVGColorById(id: string) {
    return getHighlightedSVGColorById(id, selected, searchResult);
  }

  function resetSearchElements(set: Set<string>) {
    setSelected(null);
    setSearchResult(set);
  }

  const toolbar = (
    <ControlGroup>      
      <MGDButton
        onClick={() => handleModelOpen({
          setModelWrapper,
          useDecodedBlob,
          requestFileFromFilesystem,
          logger          
        })}
      >        
        Open Model
      </MGDButton>
      <Popover2
        minimal
        placement="bottom-start"
        content={
          <ViewToolMenu
            funPage={funPage}
            setFunPage={setFunPage}
          />
        }
      >
        <MGDButton>Tools</MGDButton>
      </Popover2>   
      <MGDButton
        type={MGDButtonType.Primary}
        disabled={state.history.items.length <= 1}
        onClick={drillUp}
      >
        Drill up
      </MGDButton>
    </ControlGroup>
  );

  const breadcrumbs = getBreadcrumbs(state.history, onPageChange);

  const selectedSideBlockConfig:SidebarBlockConfig = {
    key: 'selected-node',
    title: 'Selected node',
    content: (
      <SelectedNodeDescription
        model={state.modelWrapper.model}
        pageid={state.modelWrapper.page}              
      />
    ),
  };
  
  const searchSideBlockConfig:SidebarBlockConfig = {
    key: 'search-node',
    title: 'Search components',
    content: (
      <SearchComponentPane
        model={state.modelWrapper.model}
        onChange={onPageAndHistroyChange}
        resetSearchElements={resetSearchElements}
      />
    ),
  };

  const sidebar = (
    <Sidebar
      stateKey="opened-register-item"
      css={sidebar_layout}
      title="Item metadata"
      blocks={[selectedSideBlockConfig, FunPages[funPage], searchSideBlockConfig]}
    />
  );

  if (isVisible) {    
    return (
      <ReactFlowProvider>       
        <Workspace
          className={className}
          toolbar={toolbar}
          sidebar={sidebar}
          navbarProps={{ breadcrumbs }}
        >
          <div css={react_flow_container_layout}>
            <ReactFlow              
              elements={getReactFlowElementsFrom(
                state.modelWrapper,
                state.dvisible,
                state.edgeDeleteVisible,
                onProcessClick,
                () => {},
                getStyleById,
                getSVGColorById
              )}
              onLoad={onLoad}
              nodesConnectable={false}
              snapToGrid={true}
              snapGrid={[10, 10]}
              nodeTypes={NodeTypes}
              edgeTypes={EdgeTypes}
              nodesDraggable={false}
            >
              <Controls>
                <DataVisibilityButton
                  isOn={state.dvisible}
                  onClick={toggleDataVisibility}
                />
              </Controls>
            </ReactFlow>
          </div>
        </Workspace>
      </ReactFlowProvider>
    );
  }
  return <div></div>;
};

export default ModelViewer;

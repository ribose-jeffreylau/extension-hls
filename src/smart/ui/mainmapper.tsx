/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React, { RefObject, useMemo, useState } from 'react';

import ModelDiagram from './mapper/ModelDiagram';
import {
  EditorApproval,
  EditorModel,
  EditorProcess,
  EditorSubprocess,
  getEditorNodeById,
  ModelType,
} from '../model/editormodel';
import {
  createMapProfile,
  createNewMapSet,
  getMappings,
  MappingMeta,
  MapProfile,
  MapSet,
} from '../model/mapmodel';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import { ControlGroup, Dialog } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import MapperFileMenu from './menu/mapperfile';
import { createPageHistory, PageHistory } from '../model/history';
import {
  isModelWrapper,
  MapperSelectedInterface,
  MapperState,
  MapperViewOption,
} from '../model/States';
import { createNewEditorModel } from '../utils/EditorFactory';
import { createEditorModelWrapper, ModelWrapper } from '../model/modelwrapper';
import {
  calculateMapping,
  filterMappings,
  MapResultType,
} from '../utils/MappingCalculator';
import MappingCanvus from './mapper/mappingCanvus';
import MapperOptionMenu from './menu/mapperOptionMenu';
import { EditMPropsInterface } from './dialog/dialogs';
import MappingEditPage from './edit/mappingedit';
import DocTemplatePane from './reporttemplate/doctemplatepane';
import MGDButton from '../MGDComponents/MGDButton';
import { dialog_layout, mappper_container } from '../../css/layout';
import { vertical_line } from '../../css/components';
import { findPageContainingElement } from '../utils/SearchFunctions';

const initModel = createNewEditorModel();
const initModelWrapper = createEditorModelWrapper(initModel);

const lineref: RefObject<HTMLDivElement> = React.createRef();

const ModelMapper: React.FC<{
  isVisible: boolean;
  className?: string;
}> = ({ isVisible, className }) => {
  const [mapProfile, setMapProfile] = useState<MapProfile>(createMapProfile());
  const [viewOption, setViewOption] = useState<MapperViewOption>({
    dataVisible: true,
    legVisible: true,
    docVisible: false,
  });
  const [implementProps, setImplProps] = useState<MapperState>({
    modelWrapper: { ...initModelWrapper },
    history: createPageHistory(initModelWrapper),
    modelType: ModelType.IMP,
    historyMap: {},
  });
  const [referenceProps, setRefProps] = useState<MapperState>({
    modelWrapper: { ...initModelWrapper },
    history: createPageHistory(initModelWrapper),
    modelType: ModelType.REF,
    historyMap: {},
  });
  const [selected, setSelected] = useState<MapperSelectedInterface>({
    modelType: ModelType.IMP,
    selected: '',
  });
  const [mapResult, setMapResult] = useState<MapResultType>({});

  const [editMappingProps, setEditMProps] = useState<EditMPropsInterface>({
    from: '',
    to: '',
  });

  const impMW = implementProps.modelWrapper as ModelWrapper;
  const refMW = referenceProps.modelWrapper;

  const impmodel = impMW.model;
  const refns = isModelWrapper(refMW)
    ? refMW.model.meta.namespace === ''
      ? 'defaultns'
      : refMW.model.meta.namespace
    : 'doc';
  if (mapProfile.mapSet[refns] === undefined) {
    mapProfile.mapSet[refns] = createNewMapSet(refns);
  }
  const mapSet = mapProfile.mapSet[refns];
  const impPage = impmodel.pages[impMW.page];

  const mapEdges = useMemo(
    () =>
      isModelWrapper(refMW)
        ? filterMappings(
            mapSet,
            impPage,
            refMW.model.pages[refMW.page],
            selected,
            impmodel.elements,
            refMW.model.elements
          )
        : [],
    [
      mapSet,
      impPage,
      isModelWrapper(refMW) ? refMW.model.pages[refMW.page] : undefined,
      selected,
    ]
  );

  function updateMapStyle({
    model = (refMW as ModelWrapper).model,
    mp = mapProfile,
  }) {
    setMapResult(calculateMapping(model, getMappings(mp, refns)));
  }

  function onMapSetChanged(ms: MapSet) {
    const newProfile: MapProfile = {
      ...mapProfile,
      mapSet: { ...mapProfile.mapSet, [ms.id]: ms },
    };
    setMapProfile(newProfile);
    updateMapStyle({ mp: newProfile });
  }

  function onRefModelChanged(model: EditorModel) {
    if (isModelWrapper(refMW)) {
      refMW.model = model;
      updateMapStyle({ model: model });
    }
  }

  function onMapProfileChanged(mp: MapProfile) {
    setMapProfile(mp);
    updateMapStyle({ mp: mp });
  }

  function onImpModelChanged(model: EditorModel) {
    onMapProfileChanged({ id: model.meta.namespace, mapSet: {}, docs: {} });
    impMW.model = model;
  }

  function onImpPropsChange(state: MapperState) {
    setImplProps(state);
  }

  function onRefPropsChange(state: MapperState) {
    setRefProps(state);
  }

  function onMappingEdit(from: string, to: string) {
    setEditMProps({ from, to });
  }

  function onMappingChange(update: MappingMeta | null) {
    if (update !== null) {
      mapProfile.mapSet[refns].mappings[editMappingProps.from][
        editMappingProps.to
      ] = update;
      setMapProfile({ ...mapProfile });
    }
    setEditMProps({
      from: '',
      to: '',
    });
  }

  function onMappingDelete() {
    const { from, to } = editMappingProps;
    const mapSet = mapProfile.mapSet[refns];
    delete mapSet.mappings[from][to];
    if (Object.keys(mapSet.mappings[from]).length === 0) {
      delete mapSet.mappings[from];
    }
    setMapProfile({ ...mapProfile });
    setEditMProps({
      from: '',
      to: '',
    });
    updateMapStyle({ mp: mapProfile });
  }

  if (!isVisible && selected.selected !== '') {
    setSelected({
      modelType: ModelType.IMP,
      selected: '',
    });
  }

  function onImpNavigate(id: string) {
    const page = findPageContainingElement(impmodel, id);
    const hm = implementProps.historyMap;
    processNavigate(page, setImplProps, implementProps, hm);
  }

  function onRefNavigate(id: string) {
    if (isModelWrapper(refMW)) {
      const page = findPageContainingElement(refMW.model, id);
      const hm = referenceProps.historyMap;
      processNavigate(page, setRefProps, referenceProps, hm);
    }
  }

  function processNavigate(
    page: EditorSubprocess | null,
    setProps: (s: MapperState) => void,
    props: MapperState,
    hm?: Record<string, PageHistory>
  ) {
    if (
      page !== null &&
      hm !== undefined &&
      hm[page.id] !== undefined &&
      isModelWrapper(props.modelWrapper)
    ) {
      setProps({
        ...props,
        modelWrapper: { ...props.modelWrapper, page: page.id },
        history: { items: [...hm[page.id].items] },
      });
    } else {
      alert('Target not found');
    }
  }

  const toolbar = (
    <ControlGroup>
      <Popover2
        minimal
        placement="bottom-start"
        content={
          <MapperFileMenu
            mapProfile={mapProfile}
            onMapProfileChanged={onMapProfileChanged}
          />
        }
      >
        <MGDButton> Mapping </MGDButton>
      </Popover2>
      <Popover2
        minimal
        placement="bottom-start"
        content={
          <MapperOptionMenu
            viewOption={viewOption}
            setOptions={setViewOption}
          />
        }
      >
        <MGDButton> View </MGDButton>
      </Popover2>
      <MGDButton
        onClick={() => setViewOption({ ...viewOption, docVisible: true })}
      >
        Report
      </MGDButton>
    </ControlGroup>
  );

  const mapEditPage =
    editMappingProps.from !== '' &&
    editMappingProps.to !== '' &&
    isModelWrapper(refMW) ? (
      <MappingEditPage
        from={
          impmodel.elements[editMappingProps.from] as
            | EditorProcess
            | EditorApproval
        }
        to={
          refMW.model.elements[editMappingProps.to] as
            | EditorProcess
            | EditorApproval
        }
        data={
          mapProfile.mapSet[refns].mappings[editMappingProps.from][
            editMappingProps.to
          ]
        }
        onDelete={onMappingDelete}
        onChange={onMappingChange}
      />
    ) : (
      <></>
    );

  if (isVisible) {
    return (
      <Workspace className={className} toolbar={toolbar}>
        <Dialog
          isOpen={editMappingProps.from !== '' || viewOption.docVisible}
          title={
            editMappingProps.from !== '' ? 'Edit Mapping' : 'Report template'
          }
          css={dialog_layout}
          onClose={
            editMappingProps.from !== ''
              ? () =>
                  setEditMProps({
                    from: '',
                    to: '',
                  })
              : () => setViewOption({ ...viewOption, docVisible: false })
          }
          canEscapeKeyClose={false}
          canOutsideClickClose={false}
        >
          {editMappingProps.from !== ''
            ? mapEditPage
            : isModelWrapper(refMW) && (
                <DocTemplatePane
                  mapProfile={mapProfile}
                  setMapProfile={setMapProfile}
                  refModel={refMW.model}
                  impModel={impmodel}
                />
              )}
        </Dialog>
        <div css={mappper_container}>
          <ModelDiagram
            modelProps={implementProps}
            viewOption={viewOption}
            setProps={onImpPropsChange}
            className={className}
            mapSet={mapSet}
            onMapSetChanged={onMapSetChanged}
            onModelChanged={onImpModelChanged}
            setSelected={setSelected}
            onMappingEdit={onMappingEdit}
            issueNavigationRequest={onRefNavigate}
            getPartnerModelElementById={
              isModelWrapper(refMW)
                ? id => getEditorNodeById(refMW.model, id)
                : undefined
            }
          />
          <div ref={lineref} css={vertical_line} />
          <ModelDiagram
            modelProps={referenceProps}
            viewOption={viewOption}
            setProps={onRefPropsChange}
            className={className}
            mapSet={mapSet}
            onMapSetChanged={onMapSetChanged}
            mapResult={mapResult}
            onModelChanged={onRefModelChanged}
            setSelected={setSelected}
            onMappingEdit={onMappingEdit}
            issueNavigationRequest={onImpNavigate}
            getPartnerModelElementById={id => getEditorNodeById(impmodel, id)}
          />
        </div>
        <MappingCanvus mapEdges={mapEdges} line={lineref} />
      </Workspace>
    );
  }
  return <></>;
};

export default ModelMapper;

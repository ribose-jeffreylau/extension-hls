import { MMELRepo } from '@/smart/model/repo';
import Workspace from '@riboseinc/paneron-extension-kit/widgets/Workspace';
import SMARTDocumentView from '@/smart/ui/mapper/document/DocumentView';
import { useContext } from 'react';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { getPathByNS, RepoFileType } from '@/smart/utils/repo/io';
import { MMELDocument } from '@/smart/model/document';
import { LoadingScreen } from '@/smart/ui/common/Loading';
import React from 'react';
import { DOCVERSION } from '@/smart/utils/constants';
import * as Logger from '@/lib/logger';

const DocumentViewer: React.FC<{
  isVisible: boolean;
  className?: string;
  repo: MMELRepo;
}> = ({ isVisible, className, repo }) => {
  const { useObjectData } = useContext(DatasetContext);

  const repoPath = getPathByNS(repo ? repo.ns : '', RepoFileType.MODEL);
  const repoModelFile = useObjectData({
    objectPaths : [repoPath],
  });
  const doc = repoModelFile.value.data[repoPath] as MMELDocument;
  if (doc && doc.version !== DOCVERSION) {
    Logger.error(
      `Warning: Document versions do not match.\nDocument version of file: ${doc.version}.\nExpected: ${DOCVERSION}.`
    );
    doc.version = DOCVERSION;
  }

  if (isVisible) {
    if (repo !== undefined && doc) {
      return (
        <Workspace className={className}>
          <SMARTDocumentView mmelDoc={doc} isRepo />
        </Workspace>
      );
    } else {
      return <LoadingScreen />;
    }
  }
  return <div></div>;
};

export default DocumentViewer;

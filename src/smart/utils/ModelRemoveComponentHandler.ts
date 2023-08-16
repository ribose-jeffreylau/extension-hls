import { DataType } from '@paneron/libmmel/interface/baseinterface';
import { DeletableNodeTypes } from '@/smart/utils/constants';

export const DeleteConfirmMessgae: Record<DeletableNodeTypes, string> = {
  [DataType.PROCESS]          : 'Confirm deleting the process?',
  [DataType.APPROVAL]         : 'Confirm deleting the approval process?',
  [DataType.TIMEREVENT]       : 'Confirm deleting the timer event?',
  [DataType.SIGNALCATCHEVENT] : 'Confirm deleting the signal catch event?',
  [DataType.EGATE]            : 'Confirm deleting the gateway?',
  [DataType.ENDEVENT]         : 'Confirm deleting the end event?',
};
import { Navigator } from './Navigator';
import { TTMenu } from './TTMenu';
import { processService, setServiceUri, setRequestMode } from './api';
import { label, registerFunction, registerLabel, registerUiType, resolveFunction, ttLabel } from './utils';
import InputUi from './widgets/InputUi';
import CheckboxUi from './widgets/CheckboxUi';
import SelectUi from './widgets/SelectUi';
import TextareaUi from './widgets/TextareaUi';
import TopDetailUi from './widgets/TopDetailUi';
import TopListUi from './widgets/TopListUi';
import TTMenuUi from './widgets/TTMenuUi';
import DebugUi from './widgets/DebugUi';

// uis
import { Breadcrumbs, RenderAction, RenderActionList, Icon } from './uis';
import './TTplain.css';

export {
  // api
  setServiceUri,
  setRequestMode,
  processService,
  // utils
  label,
  registerLabel,
  ttLabel,
  registerUiType,
  registerFunction,
  resolveFunction,
  // ui
  Breadcrumbs,
  RenderAction,
  RenderActionList,
  Icon,
  // navigator
  Navigator,
  TTMenu,
  // widgets
  DebugUi,
  InputUi,
  CheckboxUi,
  SelectUi,
  TextareaUi,
  TopDetailUi,
  TopListUi,
  TTMenuUi
};

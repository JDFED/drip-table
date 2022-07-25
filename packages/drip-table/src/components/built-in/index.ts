/**
 * This file is part of the drip-table project.
 * @link     : https://drip-table.jd.com/
 * @author   : helloqian12138 (johnhello12138@163.com)
 * @modifier : helloqian12138 (johnhello12138@163.com)
 * @copyright: Copyright (c) 2020 JD Network Technology Co., Ltd.
 */

import DTCButton, { DTCButtonColumnSchema, DTCButtonEvent } from './button';
import DTCGroup, { DTCGroupColumnSchema } from './group';
import DTCImage, { DTCImageColumnSchema } from './image';
import DTCLink, { DTCLinkColumnSchema, DTCLinkEvent } from './link';
import DTCRenderHTML, { DTCRenderHTMLColumnSchema } from './render-html';
import DTCRenderHTMLRemote, { DTCRenderHTMLRemoteColumnSchema } from './render-html-remote';
import DTCRichText, { DTCRichTextColumnSchema } from './rich-text';
import DTCTag, { DTCTagColumnSchema } from './tag';
import DTCText, { DTCTextColumnSchema } from './text';

export type { DripTableComponentProps } from './component';

export type DripTableBuiltInComponentEvent =
  | DTCLinkEvent
  | DTCButtonEvent;

export type DripTableBuiltInColumnSchema<CustomComponentSchema = never> =
  | DTCImageColumnSchema
  | DTCLinkColumnSchema
  | DTCButtonColumnSchema
  | DTCTextColumnSchema
  | DTCTagColumnSchema
  | DTCRenderHTMLColumnSchema
  | DTCRenderHTMLRemoteColumnSchema
  | DTCGroupColumnSchema<CustomComponentSchema>
  | DTCRichTextColumnSchema;

const DripTableBuiltInComponents = {
  [DTCImage.componentName]: DTCImage,
  [DTCLink.componentName]: DTCLink,
  [DTCButton.componentName]: DTCButton,
  [DTCText.componentName]: DTCText,
  [DTCTag.componentName]: DTCTag,
  [DTCRenderHTML.componentName]: DTCRenderHTML,
  [DTCRenderHTMLRemote.componentName]: DTCRenderHTMLRemote,
  [DTCGroup.componentName]: DTCGroup,
  [DTCRichText.componentName]: DTCRichText,
};
export default DripTableBuiltInComponents;

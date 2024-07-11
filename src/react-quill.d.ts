declare module 'react-quill' {
    import * as React from 'react';
  
    interface ReactQuillProps {
      value: string;
      onChange: (value: string) => void;
      ref?: React.RefObject<any>;
      style?: React.CSSProperties;
    }
  
    export default class ReactQuill extends React.Component<ReactQuillProps> {}
  }
  
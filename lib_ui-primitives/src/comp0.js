import { createElement as rc } from 'react';
import { TextStyle } from './styles';
import kebabCase from 'lodash.kebabcase';
export default function Comp0(props) {
    const childText = kebabCase(props.children);
    return rc(TextStyle, null, childText);
}
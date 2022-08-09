// This creates a true ES6 module for styled-components.
// The normal import is actually a commonjs module with a default property
// and, therefore, works fine with babel, but creates all sorts of problems
// while testing.
import _styled from 'styled-components';

/** @type {import('styled-components').StyledInterface} */
const styled = _styled.default ?? _styled;

export default styled;
export const ThemeContext = _styled.ThemeContext;
export const createGlobalStyle = _styled.createGlobalStyle;

// import styled from '@emotion/native';
// export default styled;
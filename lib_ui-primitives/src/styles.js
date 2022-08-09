import { Text } from 'react-native';
import styled from './styled';
// Text can be rendered before the Theme has finished loading, so provide defaults for this primitive.
export const TextStyle = styled(Text)`
    color: ${({ theme }) => theme?.defaultFontColor ?? 'green'};
    font-size: ${({ theme }) => (theme?.fontSize ?? '16') + 'px'};
    font-family: ${({ theme }) => theme?.font ?? 'Roboto'};
`;
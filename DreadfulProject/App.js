/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import { createElement as rc } from 'react';
import {
    useColorScheme
} from 'react-native';
import { Comp0 } from 'lib_ui-primitives';

const App = () => {
    const isDarkMode = useColorScheme() === 'dark';


    return rc(Comp0, null, 'this is horrid');
};

// const styles = StyleSheet.create({
//     sectionContainer: {
//         marginTop: 32,
//         paddingHorizontal: 24,
//     },
//     sectionTitle: {
//         fontSize: 24,
//         fontWeight: '600',
//     },
//     sectionDescription: {
//         marginTop: 8,
//         fontSize: 18,
//         fontWeight: '400',
//     },
//     highlight: {
//         fontWeight: '700',
//     },
// });

export default App;

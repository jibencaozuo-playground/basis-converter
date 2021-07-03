import React from 'react';
import {Client as Styletron} from 'styletron-engine-atomic';
import {Provider as StyletronProvider} from 'styletron-react';
import {BaseProvider, LightTheme} from 'baseui';

import { Encoder } from './pages/Encoder/Encoder';

const engine = new Styletron();

function App() {
  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={LightTheme}>
        <div className="App">
          <Encoder />
        </div>
      </BaseProvider>
    </StyletronProvider>
  );
}

export default App;

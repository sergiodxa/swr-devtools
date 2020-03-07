import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { mutate, cache } from 'swr';
import SWRDevtools from '../src';

function App() {
  const [key, setKey] = React.useState<string>('');
  const [value, setValue] = React.useState<string>('');
  const [isObject, setIsObject] = React.useState<boolean>(false);

  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          setKey('');
          setValue('');
          setIsObject(false);
          mutate(key, isObject ? { value } : value, false);
        }}
      >
        <input
          placeholder="Key"
          type="text"
          value={key}
          onChange={e => setKey(e.target.value)}
        />
        <input
          placeholder="Value"
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <input
          type="checkbox"
          checked={isObject}
          onChange={() => setIsObject(!isObject)}
        />
        <button>Create</button>
      </form>
      <SWRDevtools />
    </div>
  );
}

mutate(
  'project/1',
  {
    id: '1',
    title: 'SWR Cache',
    owner: [
      { type: 'users', id: '1', name: 'Sergio' },
      { type: 'users', id: '2', name: 'Daniel' },
    ],
  },
  false
);

mutate(
  'projects',
  [
    {
      id: '1',
      title: 'SWR DevTools',
      owner: [
        { type: 'users', id: '1', name: 'Sergio' },
        { type: 'users', id: '2', name: 'Daniel' },
      ],
    },
    {
      id: '2',
      title: 'SWR',
      owner: { type: 'users', id: '3', name: 'ZEIT' },
    },
  ],
  false
);

mutate('err@key-error', { value: "error message" }, false);
let i = 1;
while (cache.keys().length < 20) {
  mutate([`key-${i}`, i], { value: i }, false);
  i++;
}

ReactDOM.render(<App />, document.getElementById('root'));

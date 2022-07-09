import React from 'react';
import cn from 'classnames';
import { useMainContext } from 'contexts/mainContext';

type TabItem = {
  id: string;
  text: string;
};

const items: TabItem[] = [
  {
    id: 'pick',
    text: 'Pick',
  },
  {
    id: 'group',
    text: 'Group',
  },
  {
    id: 'order',
    text: 'Order',
  },
];

type Props = {};

function Tabs({}: Props) {
  const [{ mode }, { changeMode }] = useMainContext();

  return (
    <div className="tabs tabs-boxed justify-center">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn('tab tab-lg', item.id === mode && 'tab-active')}
          onClick={() => changeMode(item.id)}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}

export default Tabs;

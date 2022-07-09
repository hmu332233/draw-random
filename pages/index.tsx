import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { IOngoingTouchMap, ITouch } from 'types';

import _sample from 'lodash/sample';
import _pickBy from 'lodash/pickBy';
import DrawRound from 'components/DrawRound';
import Progress from 'components/Progress';
import Background from 'components/Background';
import SettingModal from 'components/SettingModal';
import useToggle from 'hooks/useToggle';

const log = process.env.NODE_ENV === 'development' ? console.log : () => {};

function copyTouch(touch: any) {
  const color = colorForTouch(touch);
  return {
    identifier: touch.identifier,
    pageX: touch.pageX,
    pageY: touch.pageY,
    color,
  };
}

function colorForTouch(touch: ITouch) {
  const colorMap = [
    'primary',
    'secondary',
    'secondary-content',
    'accent',
    'neutral-content',
    'info',
    'info-content',
    'base-content',
    'success',
    'success-content',
    'warning',
    'error',
    'error-content',
  ];
  const index = touch.identifier % colorMap.length;
  return colorMap[index];
}

const useTouches = () => {
  const [active, setActive] = useState(false);
  const [ongoingTouchMap, setOngoingTouchMap] = useState<IOngoingTouchMap>({});
  // const [nomalizedTouches, setNomalizedTouches] = useState<INomalizedTouches>({ ids: [], entities: {} });

  useEffect(() => {
    if (!active) {
      return;
    }
    // function handleStart(event: TouchEvent) {
    //   if (event.cancelable) event.preventDefault();
    //   log('touchstart.');
    //   // event.changedTouches.length;

    //   const touchesObj: { [key: string]: any } = {};
    //   for (let i = 0; i < event.changedTouches.length; i++) {
    //     const touch = copyTouch(event.changedTouches[i]);
    //     touchesObj[touch.identifier] = touch;
    //   }

    //   setOngoingTouches((arr) => ({ ...arr, ...touchesObj }));
    // }

    function handleMove(event: TouchEvent) {
      if (event.cancelable) event.preventDefault();

      log('touchmove');
      const touchesObj: { [key: string]: any } = {};
      for (let i = 0; i < event.changedTouches.length; i++) {
        const touch = copyTouch(event.changedTouches[i]);
        touchesObj[touch.identifier] = touch;
      }

      setOngoingTouchMap((arr) => ({ ...arr, ...touchesObj }));
    }

    function handleEnd(event: TouchEvent) {
      if (event.cancelable) event.preventDefault();
      log('touchend');

      const touchesObj: { [key: string]: any } = {};
      for (let i = 0; i < event.changedTouches.length; i++) {
        const touch = copyTouch(event.changedTouches[i]);
        touchesObj[touch.identifier] = undefined;
      }

      setOngoingTouchMap((arr) =>
        _pickBy({ ...arr, ...touchesObj }, (v) => v !== undefined),
      );
    }

    document.addEventListener('touchstart', handleMove);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);

    return () => {
      document.removeEventListener('touchstart', handleMove);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
    };
  }, [active]);

  // useEffect(() => {
  //   const ids = Object.keys(ongoingTouches);
  //   setNomalizedTouches({ ids, entities: { ...ongoingTouches } });
  // }, [ongoingTouches]);

  return { ongoingTouchMap, setActive };
};

const Home: NextPage = () => {
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const { ongoingTouchMap, setActive } = useTouches();
  const ongoingTouches = Object.values(ongoingTouchMap);

  const [isOpen, toggle] = useToggle(true);

  useEffect(() => {
    setActive(!isOpen);
  }, [isOpen, setActive]);

  useEffect(() => {
    if (ongoingTouches.length === 0) {
      return;
    }
    log('start selecting!');
    const selectingTimerId = setTimeout(() => {
      setSelecting(true);
    }, 500);

    const sampleTimerId = setTimeout(() => {
      const touch = _sample<ITouch>(ongoingTouches)!;
      setSelected(touch.identifier);
      log('selected', touch);
    }, 3000);

    return () => {
      setSelecting(false);
      log('clear');
      setSelected(null);
      clearTimeout(selectingTimerId);
      clearTimeout(sampleTimerId);
    };
  }, [ongoingTouches.length]);

  return (
    <div className="flex">
      <Background />
      <Progress on={selecting} />
      {ongoingTouches
        .filter((touch) =>
          selected !== null ? touch.identifier === selected : true,
        )
        .map((touch) => (
          <DrawRound
            key={touch.identifier}
            x={touch.pageX}
            y={touch.pageY}
            color={touch.color}
          />
        ))}
      <SettingModal isOpen={isOpen} toggle={toggle} />
    </div>
  );
};

export default Home;

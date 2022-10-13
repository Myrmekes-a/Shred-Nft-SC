import React, { createRef, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import Header from '../../components/Header';

const SCREEN_WIDTH = [1800, 1440, 1156, 900];

const useRefDimensions = (ref) => {
  const [dimensions, setDimensions] = useState({ width: 1, height: 2 })
  useEffect(() => {
    if (ref.current) {
      const { current } = ref
      const boundingRect = current.getBoundingClientRect()
      const { width, height } = boundingRect
      setDimensions({ width: Math.round(width), height: Math.round(height) })
    }
    // eslint-disable-next-line
  }, [])
  return dimensions
}

export default function DashboardLayout({ children, ...props }) {
	const [bootCampIndex, setBootCampIndex] = useState(0)
  const divRef = createRef()
  const dimensions = useRefDimensions(divRef)

  return (
    <div ref={divRef}>
      <Header
        SCREEN_WIDTH={SCREEN_WIDTH}
        dimensions={dimensions}
        setBootCampIndex={setBootCampIndex}
      />
      {React.cloneElement(children, {
        SCREEN_WIDTH,
        dimensions,
        bootCampIndex,
        setBootCampIndex: (e) => setBootCampIndex(e),
      })}
      <ToastContainer
        autoClose={5000}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

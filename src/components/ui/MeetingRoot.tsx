import '@zoom/meetingsdk/dist/css/react-select.css';
import '@zoom/meetingsdk/dist/css/bootstrap.css';
import { useRef } from 'react';

const MeetingRoot = () => {
    const meetingSDKElement = useRef(null);

    return (
        <div>
            <div id="zmmtg-root"></div>
            <div id="JsMediaSDK_Instance"></div>
            <div ref={meetingSDKElement}></div>
        </div>
    )
}

export default MeetingRoot
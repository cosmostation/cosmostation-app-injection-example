import { useEffect, useMemo, useState } from "react";

import UAParser from "ua-parser-js";

const useUserAgent = () => {
  const [userAgent, setUserAgent] = useState<UAParser.IResult>();

  useEffect(() => {
    const uaString = navigator.userAgent.toLowerCase();
    const parser = new UAParser(uaString);
    const result = parser.getResult();

    setUserAgent(result);
  }, []);

  const deviceType = useMemo(() => {
    return userAgent?.device.type;
  }, [userAgent]);

  const isMobile = useMemo(() => {
    return userAgent?.device.type === "mobile";
  }, [userAgent]);

  const isAndroid = useMemo(() => {
    return userAgent?.os.name?.toLowerCase() === "android";
  }, [userAgent]);

  const isiOS = useMemo(() => {
    return userAgent?.os.name?.toLowerCase() === "ios";
  }, [userAgent]);

  const isChrome = useMemo(() => {
    return userAgent?.browser.name?.toLowerCase() === "chrome";
  }, [userAgent]);

  const isFirefox = useMemo(() => {
    return userAgent?.browser.name?.toLowerCase() === "firefox";
  }, [userAgent]);

  return {
    userAgent,
    deviceType,
    isMobile,
    isAndroid,
    isiOS,
    isChrome,
    isFirefox,
  };
};

export default useUserAgent;

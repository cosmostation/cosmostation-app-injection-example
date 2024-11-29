let providers: EIP6963ProviderDetail[] = [];

export const eip6963ProviderStore = {
  value: () => providers,
  subscribe: (callback: () => void) => {
    function onAnnouncement(event: EIP6963AnnounceProviderEvent) {
      if (providers.map((p) => p.info.uuid).includes(event.detail.info.uuid))
        return;
      providers = [...providers, event.detail].sort((item) =>
        item.info.name === "Cosmostation Wallet" ? -1 : 1
      );
      callback();
    }
    window.addEventListener("eip6963:announceProvider", onAnnouncement);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () =>
      window.removeEventListener("eip6963:announceProvider", onAnnouncement);
  },
};

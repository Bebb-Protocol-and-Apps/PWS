### Dev Notes
need to use single quotes in HTML to store as Text (which has double quotes)

remove all newlines and other space (used for exampleString): https://www.textfixer.com/tools/remove-line-breaks.php

Example how to inject Svelte component into HTML document:
      setTimeout(() => {
        console.log("Login button - Delayed for 1 second.");
        var div = document.createElement('DIV');
        div.setAttribute("style","position: absolute;top: 0;right: 0;width: 100%;height: 2em;display: flex;justify-content: end;align-items: end;z-index: 10;")
        const embed = new Login({
          target: div,
        });
        document.body.prepend(div);
      }, 1000);

Removed dependencies (2023-02-28):
    "lit-html": "^2.6.1",
    "html-webpack-plugin": "5.5.0",
    "stream-browserify": "3.0.0",
    "terser-webpack-plugin": "^5.3.6",

Space Neighbors local testing with dummy entities:
    /* // for local testing, fill with dummy data
        const dummyTestEntity1 = {
                internalId: "internalEntityId1",
                creationTimestamp: 11111,
                creator: spaceNft.owner,
                owner: spaceNft.owner,
                settings: null,
                entityType: "Webasset",
                name: null,
                description: null,
                keywords: null,
                externalId: "https://vdfyi-uaaaa-aaaai-acptq-cai.ic0.app/#/space/0",
                entitySpecificFields: null,
                listOfEntitySpecificFieldKeys: null,
            };
            const dummyTestEntity2 = {
                internalId: "internalEntityId2",
                creationTimestamp: 2222,
                creator: spaceNft.owner,
                owner: spaceNft.owner,
                settings: null,
                entityType: "Webasset",
                name: null,
                description: null,
                keywords: null,
                externalId: "https://vdfyi-uaaaa-aaaai-acptq-cai.ic0.app/#/space/1",
                entitySpecificFields: null,
                listOfEntitySpecificFieldKeys: null,
            };
            const dummyTestEntity4 = {
                internalId: "internalEntityId4",
                creationTimestamp: 44444444444,
                creator: spaceNft.owner,
                owner: spaceNft.owner,
                settings: null,
                entityType: "Webasset",
                name: null,
                description: null,
                keywords: null,
                externalId: "https://vdfyi-uaaaa-aaaai-acptq-cai.ic0.app/#/space/3",
                entitySpecificFields: null,
                listOfEntitySpecificFieldKeys: null,
            };
            const dummyTestEntity3 = {
                internalId: "internalEntityId3",
                creationTimestamp: 3333333,
                creator: spaceNft.owner,
                owner: spaceNft.owner,
                settings: null,
                entityType: "Webasset",
                name: null,
                description: null,
                keywords: null,
                externalId: "https://vdfyi-uaaaa-aaaai-acptq-cai.ic0.app/#/space/2",
                entitySpecificFields: null,
                listOfEntitySpecificFieldKeys: null,
            };
            spaceNeighborsResponse = [dummyTestEntity1, dummyTestEntity2, dummyTestEntity3, dummyTestEntity4]; */
        
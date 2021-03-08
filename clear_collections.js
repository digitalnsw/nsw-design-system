module.exports = (collectionNames) => {
    return function (files, metalsmith, done) {
        "use strict";
        let meta = metalsmith.metadata();

        for (let collection of collectionNames) {
            if (collection in meta) {
                meta[collection] = [];
                console.log("rm collection");
            }
        }
        metalsmith.metadata(meta);
        done();
    };
};

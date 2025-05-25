"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
const { combine, timestamp, prettyPrint } = winston_1.format;
exports.logger = (0, winston_1.createLogger)({
    level: 'info',
    format: combine(timestamp(), prettyPrint()),
    transports: [
        new winston_1.transports.Console(),
        new winston_1.transports.File({ filename: 'error.log', level: 'error' }),
        new winston_1.transports.File({ filename: 'combined.log' })
    ]
});
//# sourceMappingURL=logger.js.map
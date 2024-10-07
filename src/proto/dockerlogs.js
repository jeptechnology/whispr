/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
(function(global, factory) { /* global define, require, module */

    /* AMD */ if (typeof define === 'function' && define.amd)
        define(["protobufjs/minimal"], factory);

    /* CommonJS */ else if (typeof require === 'function' && typeof module === 'object' && module && module.exports)
        module.exports = factory(require("protobufjs/minimal"));

})(this, function($protobuf) {
    "use strict";

    // Common aliases
    var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
    
    // Exported root namespace
    var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
    
    $root.LogEntry = (function() {
    
        /**
         * Properties of a LogEntry.
         * @exports ILogEntry
         * @interface ILogEntry
         * @property {string|null} [source] LogEntry source
         * @property {number|Long|null} [timeNano] LogEntry timeNano
         * @property {string|null} [line] LogEntry line
         */
    
        /**
         * Constructs a new LogEntry.
         * @exports LogEntry
         * @classdesc Represents a LogEntry.
         * @implements ILogEntry
         * @constructor
         * @param {ILogEntry=} [properties] Properties to set
         */
        function LogEntry(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }
    
        /**
         * LogEntry source.
         * @member {string} source
         * @memberof LogEntry
         * @instance
         */
        LogEntry.prototype.source = "";
    
        /**
         * LogEntry timeNano.
         * @member {number|Long} timeNano
         * @memberof LogEntry
         * @instance
         */
        LogEntry.prototype.timeNano = $util.Long ? $util.Long.fromBits(0,0,true) : 0;
    
        /**
         * LogEntry line.
         * @member {string} line
         * @memberof LogEntry
         * @instance
         */
        LogEntry.prototype.line = "";
    
        /**
         * Creates a new LogEntry instance using the specified properties.
         * @function create
         * @memberof LogEntry
         * @static
         * @param {ILogEntry=} [properties] Properties to set
         * @returns {LogEntry} LogEntry instance
         */
        LogEntry.create = function create(properties) {
            return new LogEntry(properties);
        };
    
        /**
         * Encodes the specified LogEntry message. Does not implicitly {@link LogEntry.verify|verify} messages.
         * @function encode
         * @memberof LogEntry
         * @static
         * @param {ILogEntry} message LogEntry message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LogEntry.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.source != null && Object.hasOwnProperty.call(message, "source"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.source);
            if (message.timeNano != null && Object.hasOwnProperty.call(message, "timeNano"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.timeNano);
            if (message.line != null && Object.hasOwnProperty.call(message, "line"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.line);
            return writer;
        };
    
        /**
         * Encodes the specified LogEntry message, length delimited. Does not implicitly {@link LogEntry.verify|verify} messages.
         * @function encodeDelimited
         * @memberof LogEntry
         * @static
         * @param {ILogEntry} message LogEntry message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LogEntry.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
    
        /**
         * Decodes a LogEntry message from the specified reader or buffer.
         * @function decode
         * @memberof LogEntry
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {LogEntry} LogEntry
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LogEntry.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.LogEntry();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.source = reader.string();
                        break;
                    }
                case 2: {
                        message.timeNano = reader.uint64();
                        break;
                    }
                case 3: {
                        message.line = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };
    
        /**
         * Decodes a LogEntry message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof LogEntry
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {LogEntry} LogEntry
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LogEntry.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
    
        /**
         * Verifies a LogEntry message.
         * @function verify
         * @memberof LogEntry
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        LogEntry.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.source != null && message.hasOwnProperty("source"))
                if (!$util.isString(message.source))
                    return "source: string expected";
            if (message.timeNano != null && message.hasOwnProperty("timeNano"))
                if (!$util.isInteger(message.timeNano) && !(message.timeNano && $util.isInteger(message.timeNano.low) && $util.isInteger(message.timeNano.high)))
                    return "timeNano: integer|Long expected";
            if (message.line != null && message.hasOwnProperty("line"))
                if (!$util.isString(message.line))
                    return "line: string expected";
            return null;
        };
    
        /**
         * Creates a LogEntry message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof LogEntry
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {LogEntry} LogEntry
         */
        LogEntry.fromObject = function fromObject(object) {
            if (object instanceof $root.LogEntry)
                return object;
            var message = new $root.LogEntry();
            if (object.source != null)
                message.source = String(object.source);
            if (object.timeNano != null)
                if ($util.Long)
                    (message.timeNano = $util.Long.fromValue(object.timeNano)).unsigned = true;
                else if (typeof object.timeNano === "string")
                    message.timeNano = parseInt(object.timeNano, 10);
                else if (typeof object.timeNano === "number")
                    message.timeNano = object.timeNano;
                else if (typeof object.timeNano === "object")
                    message.timeNano = new $util.LongBits(object.timeNano.low >>> 0, object.timeNano.high >>> 0).toNumber(true);
            if (object.line != null)
                message.line = String(object.line);
            return message;
        };
    
        /**
         * Creates a plain object from a LogEntry message. Also converts values to other types if specified.
         * @function toObject
         * @memberof LogEntry
         * @static
         * @param {LogEntry} message LogEntry
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        LogEntry.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.source = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.timeNano = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.timeNano = options.longs === String ? "0" : 0;
                object.line = "";
            }
            if (message.source != null && message.hasOwnProperty("source"))
                object.source = message.source;
            if (message.timeNano != null && message.hasOwnProperty("timeNano"))
                if (typeof message.timeNano === "number")
                    object.timeNano = options.longs === String ? String(message.timeNano) : message.timeNano;
                else
                    object.timeNano = options.longs === String ? $util.Long.prototype.toString.call(message.timeNano) : options.longs === Number ? new $util.LongBits(message.timeNano.low >>> 0, message.timeNano.high >>> 0).toNumber(true) : message.timeNano;
            if (message.line != null && message.hasOwnProperty("line"))
                object.line = message.line;
            return object;
        };
    
        /**
         * Converts this LogEntry to JSON.
         * @function toJSON
         * @memberof LogEntry
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        LogEntry.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
    
        /**
         * Gets the default type url for LogEntry
         * @function getTypeUrl
         * @memberof LogEntry
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        LogEntry.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/LogEntry";
        };
    
        return LogEntry;
    })();

    return $root;
});

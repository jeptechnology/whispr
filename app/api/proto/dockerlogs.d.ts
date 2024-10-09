import * as $protobuf from "protobufjs";
import Long = require("long");
/** Properties of a LogEntry. */
export interface ILogEntry {

    /** LogEntry source */
    source?: (string|null);

    /** LogEntry timeNano */
    timeNano?: (number|Long|null);

    /** LogEntry line */
    line?: (string|null);
}

/** Represents a LogEntry. */
export class LogEntry implements ILogEntry {

    /**
     * Constructs a new LogEntry.
     * @param [properties] Properties to set
     */
    constructor(properties?: ILogEntry);

    /** LogEntry source. */
    public source: string;

    /** LogEntry timeNano. */
    public timeNano: (number|Long);

    /** LogEntry line. */
    public line: string;

    /**
     * Creates a new LogEntry instance using the specified properties.
     * @param [properties] Properties to set
     * @returns LogEntry instance
     */
    public static create(properties?: ILogEntry): LogEntry;

    /**
     * Encodes the specified LogEntry message. Does not implicitly {@link LogEntry.verify|verify} messages.
     * @param message LogEntry message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ILogEntry, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified LogEntry message, length delimited. Does not implicitly {@link LogEntry.verify|verify} messages.
     * @param message LogEntry message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ILogEntry, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a LogEntry message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns LogEntry
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LogEntry;

    /**
     * Decodes a LogEntry message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns LogEntry
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LogEntry;

    /**
     * Verifies a LogEntry message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a LogEntry message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns LogEntry
     */
    public static fromObject(object: { [k: string]: any }): LogEntry;

    /**
     * Creates a plain object from a LogEntry message. Also converts values to other types if specified.
     * @param message LogEntry
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: LogEntry, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this LogEntry to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for LogEntry
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

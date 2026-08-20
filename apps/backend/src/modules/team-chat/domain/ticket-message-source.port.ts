export const TICKET_MESSAGE_SOURCE = Symbol('TICKET_MESSAGE_SOURCE');

export type TicketMessageSnapshot = {
  text: string;
  fromName: string;
};

export interface TicketMessageSourcePort {
  getPublicMessage(
    ticketId: number,
    messageId: string,
  ): Promise<TicketMessageSnapshot | null>;

  receiveForwarded(
    ticketId: number,
    input: { text: string; fromName: string },
  ): Promise<void>;
}

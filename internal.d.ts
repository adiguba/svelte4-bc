export type Props = Record<string,any> & {
    $$slots?: Record<string, true | Function>,
    $$events?: Record<string, EventListener | Array<EventListener>>
}


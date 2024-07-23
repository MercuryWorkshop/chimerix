/*
 * Copyright (C) 2024 Puter Technologies Inc.
 *
 * This file is part of Puter.
 *
 * Puter is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { BetterReader } from "dev-pty-mirror";

const encoder = new TextEncoder();

export class AnuraPTT {
    process;

    constructor(process) {
        this.process = process;

        this.readableStream = new ReadableStream({
            start: (controller) => {
              this.readController = controller;
            },
        });
        this.stderrWritableStream =  new WritableStream({
            start: (controller) => {
                this.writeController = controller;
            },
            write: (chunk) => {
                if (typeof chunk === "string") {
                    chunk = encoder.encode(chunk);
                }
                window.postMessage({
                    type: "stderr",
                    message: chunk,
                });
            },
        });
        this.stdoutWritableStream = new WritableStream({
            start: (controller) => {
                this.writeController = controller;
            },
            write: (chunk) => {
                if (typeof chunk === "string") {
                    chunk = encoder.encode(chunk);
                }
                window.postMessage({
                    type: "stdout",
                    message: chunk,
                });
            },
        });

        this.out = this.stdoutWritableStream.getWriter();
        this.err = this.stderrWritableStream.getWriter();
        this.in = this.readableStream.getReader();
        this.in = new BetterReader({ delegate: this.in });

        window.addEventListener("message", (event) => {
            if (event.data.type === "stdin") {
                if (typeof event.data.message === "string") {
                    event.data.message = encoder.encode(event.data.message);
                }

                this.readController.enqueue(event.data.message);
            }
            if (event.data.type.startsWith("ioctl")) {
                this.emit(event.data.type, event.data);
            }
        });

        console.log(window)

        this.ioctl_listeners = {};

        this.on("ready", () => {
            window.postMessage({
                type: "ready",
            });
        });
    }

    on (name, listener) {
        if ( ! this.ioctl_listeners.hasOwnProperty(name) ) {
            this.ioctl_listeners[name] = [];
        }
        this.ioctl_listeners[name].push(listener);
    }

    emit (name, evt) {
        if ( ! this.ioctl_listeners.hasOwnProperty(name) ) return;
        for ( const listener of this.ioctl_listeners[name] ) {
            listener(evt);
        }
    }
}

(() => {
    const hasScheduler =
        typeof window.scheduler === "object" &&
        window.scheduler !== null &&
        typeof window.scheduler.postTask === "function";

    if (!hasScheduler) {
        window.scheduler = {
            postTask: (cb) =>
                Promise.resolve().then(() => {
                    if (typeof cb === "function") {
                        return cb();
                    }
                    return undefined;
                }),
        };
    }
})();

!(function(e, t) {
    "object" == typeof exports && "undefined" != typeof module ?
        (module.exports = t()) :
        "function" == typeof define && define.amd ?
        define(t) :
        ((e = e || self).deepmerge = t());
})(this, function() {
    "use strict";
    var e = function(e) {
            return (
                (function(e) {
                    return !!e && "object" == typeof e;
                })(e) &&
                !(function(e) {
                    var n = Object.prototype.toString.call(e);
                    return (
                        "[object RegExp]" === n ||
                        "[object Date]" === n ||
                        (function(e) {
                            return e.$$typeof === t;
                        })(e)
                    );
                })(e)
            );
        },
        t =
        "function" == typeof Symbol && Symbol.for ?
        Symbol.for("react.element") :
        60103;

    function n(e, t) {
        return !1 !== t.clone && t.isMergeableObject(e) ?
            o(((n = e), Array.isArray(n) ? [] : {}), e, t) :
            e;
        var n;
    }

    function s(e, t, s) {
        return e.concat(t).map(function(e) {
            return n(e, s);
        });
    }

    function i(e) {
        return Object.keys(e).concat(
            (function(e) {
                return Object.getOwnPropertySymbols ?
                    Object.getOwnPropertySymbols(e).filter(function(t) {
                        return e.propertyIsEnumerable(t);
                    }) : [];
            })(e)
        );
    }

    function a(e, t) {
        try {
            return t in e;
        } catch (e) {
            return !1;
        }
    }

    function r(e, t, s) {
        var r = {};
        return (
            s.isMergeableObject(e) &&
            i(e).forEach(function(t) {
                r[t] = n(e[t], s);
            }),
            i(t).forEach(function(i) {
                (function(e, t) {
                    return (
                        a(e, t) &&
                        !(
                            Object.hasOwnProperty.call(e, t) &&
                            Object.propertyIsEnumerable.call(e, t)
                        )
                    );
                })(e, i) ||
                (a(e, i) && s.isMergeableObject(t[i]) ?
                    (r[i] = (function(e, t) {
                        if (!t.customMerge) return o;
                        var n = t.customMerge(e);
                        return "function" == typeof n ? n : o;
                    })(i, s)(e[i], t[i], s)) :
                    (r[i] = n(t[i], s)));
            }),
            r
        );
    }

    function o(t, i, a) {
        ((a = a || {}).arrayMerge = a.arrayMerge || s),
        (a.isMergeableObject = a.isMergeableObject || e),
        (a.cloneUnlessOtherwiseSpecified = n);
        var o = Array.isArray(i);
        return o === Array.isArray(t) ?
            o ?
            a.arrayMerge(t, i, a) :
            r(t, i, a) :
            n(i, a);
    }
    return (
        (o.all = function(e, t) {
            if (!Array.isArray(e))
                throw new Error("first argument should be an array");
            return e.reduce(function(e, n) {
                return o(e, n, t);
            }, {});
        }),
        o
    );
});


class BaseComponent {
    constructor({
        name,
        element,
        loadInnerComponents,
        parent,
        defaults,
        innerElements,
    }) {

        this.mounted = false;
        this.containerAnimation = undefined;

        this.dataReady = new Promise((resolve) => {
            this._setDataReady = resolve;
        });
        this.ready = new Promise((resolve) => {
            this._setReady = resolve;
        });
        this.webGLReady = new Promise((resolve) => {
            this._setWebGLReady = resolve;
        });

        this.loadInnerComponents = loadInnerComponents;
        this.name = name;
        this.element = element;
        this.parent = parent;
        this.defaults = typeof defaults === "function" ? defaults() : defaults;
        this.innerSelectors = innerElements;

        this.components = [];
        this.elements = {};
        this.options = {};
        Promise.all([
            this._updateOptions(),
            this._updateElements({
                container: this.element,
                elements: this.innerSelectors,
            }),
        ]).finally(() => this._setDataReady());
    }
    setup() {
        Promise.all([this.dataReady, document.fonts.ready])
            .then(() => this.init())
            .finally(() => this._setReady());
    }

    _updateOptions({
        container: e = this.element,
        target: t = this.options,
        defaults: n = this.defaults,
        attributeSelector: s = "data-arts-component-options",
        options: i = {},
    } = {}) {
        return new Promise((a) => {
            if (!e) return a(!0), {};
            const r = [];
            let o = {};
            if (i && n) {
                const e = scheduler.postTask(() => {
                    o = deepmerge(n, i);
                });
                r.push(e);
            }
            if (s) {
                let t;
                const n = new Promise((n) => {
                    (t = app.utilities.parseOptionsStringObject(e.getAttribute(s))),
                    t && 0 !== Object.keys(t).length ?
                        scheduler
                        .postTask(() => {
                            o = deepmerge(o, t);
                        })
                        .finally(() => n(!0)) :
                        n(!0);
                });
                r.push(n);
            }
            Promise.all(r).finally(() => {
                Object.assign(t, o), a(!0);
            });
        });
    }
    _updateElements({
        container: e,
        elements: t
    }) {
        return new Promise((n) => {
            if (e && t && "object" == typeof t) {
                const s = [];
                this.element = e;
                for (const n in t) {
                    const i = scheduler.postTask(() => {
                        const s = `${t[n]}`;
                        Object.assign(this.elements, {
                            [n]: [...e.querySelectorAll(s)]
                        });
                    });
                    s.push(i);
                }
                Promise.all(s).finally(() => n(!0));
            } else n(!0);
        });
    }
    _getInnerComponentByName(e) {
        const t = this.components.findIndex((t) => t.name === e);
        return t > -1 && this.components[t];
    }
    _getInnerElementByName(e) {
        if (this.elements[e] && this.elements[e][0]) return this.elements[e][0];
    }
}
class ComponentsManager {
    constructor() {
        this.instances = {
            persistent: [],
            disposable: []
        };
    }
    init({
        scope: e = document,
        scopeExclude: t = [],
        parent: n = null,
        loadInnerComponents: s = !0,
        storage: i = this.instances.disposable,
        selector: a = ":scope [data-arts-component-name]:not(:scope [data-arts-component-name] [data-arts-component-name])",
        loadOnlyFirst: r = !1,
        nameAttribute: o = "data-arts-component-name",
        optionsAttribute: l = "data-arts-component-options",
    }) {
        if (!e) return [];
        let c = r ? [e.querySelector(a)] : [...e.querySelectorAll(a)],
            p = [];
        return (
            n ||
            ((c = c.filter(
                    (e) =>
                    e &&
                    !e.matches(
                        ":scope [data-arts-component-name] [data-arts-component-name]"
                    )
                )),
                r || t.length || (c[0] = null)),
            t.length &&
            (c = c.filter((e) => {
                let n = !0;
                return (
                    t.forEach((t) => {
                        t.contains(e) && (n = !1);
                    }),
                    n
                );
            })),
            c &&
            c.length &&
            c.forEach((e) => {
                const t = this.loadComponent({
                    el: e,
                    parent: n,
                    storage: i,
                    loadInnerComponents: s,
                    nameAttribute: o,
                    optionsAttribute: l,
                });
                p.push(t);
            }),
            p
        );
    }
    loadComponent({
        el: e,
        loadInnerComponents: t,
        parent: n,
        storage: s,
        name: i,
        nameAttribute: a = "data-arts-component-name",
        optionsAttribute: r = "data-arts-component-options",
        options: o,
    }) {
        if (!e)
            return new Promise((e) => {
                e(!0);
            });
        const l = i || e.getAttribute(a),
            c = o || e.getAttribute(r);
        return new Promise((i, a) => {
            if (void 0 !== window[l]) {
                const a = new window[l]({
                    name: l,
                    loadInnerComponents: t,
                    parent: n,
                    element: e,
                    options: c,
                });
                s.push(a), a.ready.finally(() => i(!0));
            } else
                app.components[l] ?
                this.load({
                    properties: app.components[l]
                })
                .then((a) => {
                    if ("object" == typeof a && "default" in a) {
                        const r = new a.default({
                            name: l,
                            loadInnerComponents: t,
                            parent: n,
                            element: e,
                            options: c,
                        });
                        s.push(r),
                            r.ready.finally(() => {
                                app.refresher &&
                                    Object.assign(app.refresher, {
                                        requiresTriggersSorting: !0,
                                    }),
                                    i(r);
                            });
                    } else i(!0);
                })
                .catch((e) => {
                    console.error(`Component "${l}" is not recognized`),
                        console.error(e),
                        i(!0);
                }) :
                (console.error(`Component "${l}" is not recognized`), i(!0));
        });
    }

}

class Utilities {
    constructor() {
        (this._handlers = {
            resize: this.debounce(
                this._updateMobileBarVh.bind(this),
                this.getDebounceTime(200)
            ),
        }),
        (this.lastVW = window.innerWidth),
        (this.lastVH = window.innerHeight),
        (this.adminBar = document.getElementById("wpadminbar")),
        this.adminBar || (this.adminBar = {
                offsetHeight: 0,
                offsetWidth: 0
            }),
            (this.mqPointer = window.matchMedia(
                "(hover: hover) and (pointer: fine)"
            )),
            this.init();
    }
    init() {
        this._attachEvents();
    }
    update() {
        this._updateMobileBarVh();
    }
    updateLazy() {
        return new Promise((e) => {
            app.lazy && "function" == typeof app.lazy.update ?
                scheduler
                .postTask(() => {
                    app.lazy.update();
                })
                .finally(() => e(!0)) :
                e(!0);
        });
    }
    destroy() {
        return new Promise((e) => {
            this._detachEvents(), e(!0);
        });
    }

    _attachEvents() {
        this.attachResponsiveResize({
            callback: this._handlers.resize,
            immediateCall: !1,
            autoDetachOnTransitionStart: !1,
        });
    }
    _detachEvents() {}
    attachResponsiveResize({
        callback: e,
        immediateCall: t = !0,
        autoDetachOnTransitionStart: n = !0,
    } = {}) {
        if ("function" != typeof e) return;
        const s = this,
            i = e.bind(e);

        function a(e) {
            this.lastVW !== window.innerWidth &&
                ((this.lastVW = window.innerWidth), i());
        }

        function r(e) {
            this.lastVH !== window.innerHeight &&
                ((this.lastVH = window.innerHeight), i());
        }
        const o = a.bind(a),
            l = r.bind(r);

        function c(e, t = !1) {
            e.matches ?
                window.addEventListener("resize", l, !1) :
                window.removeEventListener("resize", l, !1),
                t && i();
        }

        function p() {
            window.removeEventListener("resize", o, !1),
                window.removeEventListener("resize", l, !1),
                "function" == typeof s.mqPointer.removeEventListener ?
                s.mqPointer.removeEventListener("change", c) :
                s.mqPointer.removeListener(c);
        }
        return (
            window.addEventListener("resize", o, !1),
            c({
                matches: s.mqPointer.matches
            }, t),
            "function" == typeof s.mqPointer.addEventListener ?
            s.mqPointer.addEventListener("change", c) :
            s.mqPointer.addListener(c),
            n &&
            app.utilities.addAJAXStartEventListener(
                () =>
                new Promise((e) => {
                    p(), e(!0);
                })
            ), {
                clear: p
            }
        );
    }
    _updateMobileBarVh() {
        return new Promise((e) => {
            let t;
            const n = scheduler.postTask(() => {
                    t = document.documentElement.clientHeight;
                }),
                s = scheduler.postTask(() => {
                    document.documentElement.style.setProperty("--client-height", t);
                }),
                i = scheduler.postTask(() => {
                    document.documentElement.style.setProperty(
                        "--fix-bar-vh",
                        0.01 * t + "px"
                    );
                });
            n.finally(() => {
                Promise.all([s, i]).finally(() => e(!0));
            });
        });
    }



    isSmoothScrollingEnabled() {
        const e = app.componentsManager.getComponentByName("Scroll");
        return e && !!e.instance;
    }
    toggleClasses(e, t, n) {
        if (e && this.isHTMLElement(e)) {
            const s = t.split(" ");
            s.length && s.map((t) => e.classList.toggle(t, n));
        }
    }
    debounce(e, t, n) {
        let s;
        return function(...i) {
            let a = this,
                r = n && !s;
            clearTimeout(s),
                (s = setTimeout(() => {
                    (s = null), n || e.apply(a, i);
                }, t)),
                r && e.apply(a, i);
        };
    }
    getDebounceTime(e = 400) {
        return e;
    }
    parseOptionsStringObject(e) {
        let t = {};
        if (!e) return t;
        try {
            t = JSON.parse(this.convertStringToJSON(e));
        } catch (t) {
            console.warn(`${e} is not a valid parameters object`);
        }
        return t;
    }
    convertStringToJSON(e) {
        if (!e) return;
        return e
            .replace(/'/g, '"')
            .replace(/(?=[^"]*(?:"[^"]*"[^"]*)*$)(\w+:)|(\w+ :)/g, function(e) {
                return '"' + e.substring(0, e.length - 1) + '":';
            });
    }

}

"use strict";
(self.webpackChunkArtsInfiniteList =
    self.webpackChunkArtsInfiniteList || []).push([
    [324],
    {
        170: (t, e, n) => {
            function i(t) {
                if (t && t.constructor === Array) {
                    var e = t
                        .filter(function(t) {
                            return "number" == typeof t;
                        })
                        .filter(function(t) {
                            return !isNaN(t);
                        });
                    if (6 === t.length && 6 === e.length) {
                        var n = r();
                        return (
                            (n[0] = e[0]),
                            (n[1] = e[1]),
                            (n[4] = e[2]),
                            (n[5] = e[3]),
                            (n[12] = e[4]),
                            (n[13] = e[5]),
                            n
                        );
                    }
                    if (16 === t.length && 16 === e.length) return t;
                }
                throw new TypeError("Expected a `number[]` with length 6 or 16.");
            }

            function r() {
                for (var t = [], e = 0; e < 16; e++) e % 5 == 0 ? t.push(1) : t.push(0);
                return t;
            }

            function s(t, e) {
                for (var n = i(t), r = i(e), s = [], a = 0; a < 4; a++)
                    for (
                        var o = [n[a], n[a + 4], n[a + 8], n[a + 12]], l = 0; l < 4; l++
                    ) {
                        var h = 4 * l,
                            c = [r[h], r[h + 1], r[h + 2], r[h + 3]],
                            u = o[0] * c[0] + o[1] * c[1] + o[2] * c[2] + o[3] * c[3];
                        s[a + h] = u;
                    }
                return s;
            }

            function a(t) {
                var e = (Math.PI / 180) * t,
                    n = r();
                return (
                    (n[0] = n[5] = Math.cos(e)),
                    (n[1] = n[4] = Math.sin(e)),
                    (n[4] *= -1),
                    n
                );
            }

            function o(t, e) {
                var n = r();
                return (n[0] = t), (n[5] = "number" == typeof e ? e : t), n;
            }
            n.r(e), n.d(e, {
                default: () => c
            });
            var l = n(199);
            const h = {};
            class c extends l.v {
                constructor({
                    autoLoad: t = !1,
                    options: e,
                    view: n,
                    config: i
                }) {
                    super({
                            autoLoad: t,
                            options: e,
                            view: n,
                            config: i,
                            defaults: h
                        }),
                        (this._handlers = {
                            updateView: this._onUpdateView.bind(this),
                            renderAll: this._renderAll.bind(this),
                        }),
                        this.init();
                }
                init() {
                    this.enabled ||
                        (this._attachEvents(),
                            this._attachToggleViewEvents(),
                            this._renderAll(),
                            (this.enabled = !0));
                }
                enable() {
                    this.enabled ||
                        (this._attachEvents(), this._renderAll(), (this.enabled = !0));
                }
                disable() {
                    this.enabled && (this._detachEvents(), (this.enabled = !1));
                }
                destroy() {
                    this.enabled &&
                        (this._detachEvents(),
                            this._detachToggleViewEvents(),
                            (this.enabled = !1));
                }
                update() {
                    this.render();
                }
                render(t, e) {
                    t && t in this.view.current ?
                        e ?
                        e in this.view.current[t].items && this.renderItem(t, e) :
                        this.renderLane(t) :
                        this._renderAll();
                }
                renderLane(t) {
                    Object.keys(this.view.current[t]).forEach((e) => {
                        this.renderItem(t, e);
                    });
                }
                renderItem(t, e) {
                    this._applyStyles(this.view.current[t].items[e]);
                }
                _onUpdateView({
                    indexLane: t,
                    indexItem: e
                }) {
                    this.renderItem(t, e);
                }
                _attachEvents() {
                    this.view.on("update", this._handlers.updateView);
                }
                _detachEvents() {
                    this.view.off("update", this._handlers.updateView);
                }
                _renderAll() {
                    Object.keys(this.view.current).forEach((t) => {
                        Object.keys(this.view.current[t].items).forEach((e) => {
                            this._applyStyles(this.view.current[t].items[e]);
                        });
                    });
                }
                _applyStyles(t) {
                    "visible" in t &&
                        c.setElementsVisible({
                            elements: [t.element],
                            visible: t.visible
                        }),

                        "transform" in t &&
                        c.setElementsTransform({
                            elements: [t.element],
                            transform: t.transform,
                        });
                }
                static setElementsVisible({
                    elements: t,
                    visible: e = !0
                }) {
                    if (t.length)
                        for (const n of t)
                            n &&
                            (e ?
                                ((n.style.visibility = "visible"), (n.style.opacity = null)) :
                                ((n.style.visibility = "hidden"), (n.style.opacity = "0")));
                }

                static setElementsTransform({
                    elements: t,
                    transform: e
                }) {
                    if (t.length) {
                        let n = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                            i = null;
                        "translate" in e &&
                            ("number" == typeof e.translate &&
                                (n = s(
                                    n,
                                    (function(t, e) {
                                        var n = r();
                                        return (n[12] = t), n;
                                    })(e.translate)
                                )),
                                "object" == typeof e.translate &&
                                (n = s(
                                    n,
                                    (function(t, e, n) {
                                        var i = r();
                                        return (
                                            void 0 !== t &&
                                            void 0 !== e &&
                                            void 0 !== n &&
                                            ((i[12] = t), (i[13] = e), (i[14] = n)),
                                            i
                                        );
                                    })(e.translate.x, e.translate.y, e.translate.z)
                                ))),
                            "scale" in e &&
                            ("number" == typeof e.scale && (n = s(n, o(e.scale))),
                                "object" == typeof e.scale && (n = o(e.scale.x, e.scale.y))),
                            "rotate" in e &&
                            ("number" == typeof e.rotate && (n = s(n, a(e.rotate))),
                                "object" == typeof e.rotate &&
                                ("x" in e.rotate &&
                                    (n = s(
                                        n,
                                        (function(t) {
                                            var e = (Math.PI / 180) * t,
                                                n = r();
                                            return (
                                                (n[5] = n[10] = Math.cos(e)),
                                                (n[6] = n[9] = Math.sin(e)),
                                                (n[9] *= -1),
                                                n
                                            );
                                        })(e.rotate.x)
                                    )),
                                    "y" in e.rotate &&
                                    (n = s(
                                        n,
                                        (function(t) {
                                            var e = (Math.PI / 180) * t,
                                                n = r();
                                            return (
                                                (n[0] = n[10] = Math.cos(e)),
                                                (n[2] = n[8] = Math.sin(e)),
                                                (n[2] *= -1),
                                                n
                                            );
                                        })(e.rotate.y)
                                    )),
                                    "z" in e.rotate && (n = s(n, a(e.rotate.z))))),
                            "skew" in e &&
                            ("number" == typeof e.skew &&
                                (n = s(
                                    n,
                                    (function(t, e) {
                                        var n = (Math.PI / 180) * t,
                                            i = r();
                                        return (i[4] = Math.tan(n)), i;
                                    })(e.skew)
                                )),
                                "object" == typeof e.skew &&
                                ("x" in e.skew &&
                                    (n = s(
                                        n,
                                        (function(t) {
                                            var e = (Math.PI / 180) * t,
                                                n = r();
                                            return (n[4] = Math.tan(e)), n;
                                        })(e.skew.x)
                                    )),
                                    "y" in e.skew &&
                                    (n = s(
                                        n,
                                        (function(t) {
                                            var e = (Math.PI / 180) * t,
                                                n = r();
                                            return (n[1] = Math.tan(e)), n;
                                        })(e.skew.y)
                                    )))),
                            "origin" in e && "string" == typeof e.origin && (i = e.origin);
                        for (const e of t)
                            e &&
                            (i && (e.style.transformOrigin = i),
                                (e.style.transform = `matrix3d(${n.toString()})`));
                    }
                }
            }
        },
    },
]);

"use strict";
(self.webpackChunkArtsInfiniteList =
    self.webpackChunkArtsInfiniteList || []).push([
    [190],
    {
        105: (t, e, i) => {
            i.r(e), i.d(e, {
                default: () => o
            });
            var r = i(199);
            const n = {
                preset: "arc",
                intensity: 0.25,
                multiLane: !1
            };
            class o extends r.v {
                constructor({
                    autoLoad: t = !1,
                    container: e,
                    options: i,
                    controller: r,
                    config: o,
                }) {
                    super({
                            autoLoad: t,
                            container: e,
                            options: i,
                            controller: r,
                            config: o,
                            defaults: n,
                        }),
                        this.init();
                }
                init() {
                    if (!this.enabled)
                        if (this.config.multiLane)
                            for (let t = 0; t < this.controller.lanes.length; t++)
                                "preset" in this.config.multiLane[t] &&
                                this._registerTransformHook(
                                    this.config.multiLane[t].preset,
                                    t
                                );
                        else {
                            const t = this.getConfigOption("preset");
                            this._registerTransformHook(t);
                        }
                }
                _registerTransformHook(t, e) {
                    switch (t) {
                        case "snake":
                            this.controller.addTransformHook(
                                this._transformerSnake.bind(this),
                                e
                            );
                            break;
                    }
                }

                _transformerSnake({
                    indexLane: t,
                    indexItem: e,
                    progressItem: i,
                    translateItem: r,
                    laneGeometry: n,
                }) {
                    const o = this.getConfigOption("intensity", t),
                        s = r,
                        a = {
                            x: 0,
                            y: 0,
                            z: i * o * 100
                        };
                    return (
                        i > 0 ?
                        ((a.z = -a.z),
                            "horizontal" === this.options.direction &&
                            (s.y -= i * i * o * n.visibleArea.height),
                            "vertical" === this.options.direction &&
                            (s.x += i * i * o * n.visibleArea.width)) :
                        ("horizontal" === this.options.direction &&
                            (s.y += i * i * o * n.visibleArea.height),
                            "vertical" === this.options.direction &&
                            (s.x -= i * i * o * n.visibleArea.width)), {
                            translate: s,
                            rotate: a,
                            origin: "center center"
                        }
                    );
                }

            }
        },
    },
]);

(() => {
    var t,
        e,
        i = {
            110: (t) => {
                function e(t, e, i) {
                    var s, n, r, o, l;

                    function a() {
                        var h = Date.now() - o;
                        h < e && h >= 0 ?
                            (s = setTimeout(a, e - h)) :
                            ((s = null), i || ((l = t.apply(r, n)), (r = n = null)));
                    }
                    null == e && (e = 100);
                    var h = function() {
                        (r = this), (n = arguments), (o = Date.now());
                        var h = i && !s;
                        return (
                            s || (s = setTimeout(a, e)),
                            h && ((l = t.apply(r, n)), (r = n = null)),
                            l
                        );
                    };
                    return (
                        (h.clear = function() {
                            s && (clearTimeout(s), (s = null));
                        }),
                        (h.flush = function() {
                            s &&
                                ((l = t.apply(r, n)),
                                    (r = n = null),
                                    clearTimeout(s),
                                    (s = null));
                        }),
                        h
                    );
                }
                (e.debounce = e), (t.exports = e);
            },
            454: (t) => {
                "use strict";
                var e = function(t) {
                        return (
                            (function(t) {
                                return !!t && "object" == typeof t;
                            })(t) &&
                            !(function(t) {
                                var e = Object.prototype.toString.call(t);
                                return (
                                    "[object RegExp]" === e ||
                                    "[object Date]" === e ||
                                    (function(t) {
                                        return t.$$typeof === i;
                                    })(t)
                                );
                            })(t)
                        );
                    },
                    i =
                    "function" == typeof Symbol && Symbol.for ?
                    Symbol.for("react.element") :
                    60103;

                function s(t, e) {
                    return !1 !== e.clone && e.isMergeableObject(t) ?
                        l(((i = t), Array.isArray(i) ? [] : {}), t, e) :
                        t;
                    var i;
                }

                function n(t, e, i) {
                    return t.concat(e).map(function(t) {
                        return s(t, i);
                    });
                }

                function r(t) {
                    return Object.keys(t).concat(
                        (function(t) {
                            return Object.getOwnPropertySymbols ?
                                Object.getOwnPropertySymbols(t).filter(function(e) {
                                    return Object.propertyIsEnumerable.call(t, e);
                                }) : [];
                        })(t)
                    );
                }

                function o(t, e) {
                    try {
                        return e in t;
                    } catch (t) {
                        return !1;
                    }
                }

                function l(t, i, a) {
                    ((a = a || {}).arrayMerge = a.arrayMerge || n),
                    (a.isMergeableObject = a.isMergeableObject || e),
                    (a.cloneUnlessOtherwiseSpecified = s);
                    var h = Array.isArray(i);
                    return h === Array.isArray(t) ?
                        h ?
                        a.arrayMerge(t, i, a) :
                        (function(t, e, i) {
                            var n = {};
                            return (
                                i.isMergeableObject(t) &&
                                r(t).forEach(function(e) {
                                    n[e] = s(t[e], i);
                                }),
                                r(e).forEach(function(r) {
                                    (function(t, e) {
                                        return (
                                            o(t, e) &&
                                            !(
                                                Object.hasOwnProperty.call(t, e) &&
                                                Object.propertyIsEnumerable.call(t, e)
                                            )
                                        );
                                    })(t, r) ||
                                    (o(t, r) && i.isMergeableObject(e[r]) ?
                                        (n[r] = (function(t, e) {
                                            if (!e.customMerge) return l;
                                            var i = e.customMerge(t);
                                            return "function" == typeof i ? i : l;
                                        })(r, i)(t[r], e[r], i)) :
                                        (n[r] = s(e[r], i)));
                                }),
                                n
                            );
                        })(t, i, a) :
                        s(i, a);
                }
                l.all = function(t, e) {
                    if (!Array.isArray(t))
                        throw new Error("first argument should be an array");
                    return t.reduce(function(t, i) {
                        return l(t, i, e);
                    }, {});
                };
                var a = l;
                t.exports = a;
            },
            100: (t) => {
                "use strict";
                var e,
                    i = "object" == typeof Reflect ? Reflect : null,
                    s =
                    i && "function" == typeof i.apply ?
                    i.apply :
                    function(t, e, i) {
                        return Function.prototype.apply.call(t, e, i);
                    };
                e =
                    i && "function" == typeof i.ownKeys ?
                    i.ownKeys :
                    Object.getOwnPropertySymbols ?
                    function(t) {
                        return Object.getOwnPropertyNames(t).concat(
                            Object.getOwnPropertySymbols(t)
                        );
                    } :
                    function(t) {
                        return Object.getOwnPropertyNames(t);
                    };
                var n =
                    Number.isNaN ||
                    function(t) {
                        return t != t;
                    };

                function r() {
                    r.init.call(this);
                }
                (t.exports = r),
                (t.exports.once = function(t, e) {
                    return new Promise(function(i, s) {
                        function n(i) {
                            t.removeListener(e, r), s(i);
                        }

                        function r() {
                            "function" == typeof t.removeListener &&
                                t.removeListener("error", n),
                                i([].slice.call(arguments));
                        }
                        g(t, e, r, {
                                once: !0
                            }),
                            "error" !== e &&
                            (function(t, e, i) {
                                "function" == typeof t.on && g(t, "error", e, {
                                    once: !0
                                });
                            })(t, n);
                    });
                }),
                (r.EventEmitter = r),
                (r.prototype._events = void 0),
                (r.prototype._eventsCount = 0),
                (r.prototype._maxListeners = void 0);
                var o = 10;

                function l(t) {
                    if ("function" != typeof t)
                        throw new TypeError(
                            'The "listener" argument must be of type Function. Received type ' +
                            typeof t
                        );
                }

                function a(t) {
                    return void 0 === t._maxListeners ?
                        r.defaultMaxListeners :
                        t._maxListeners;
                }

                function h(t, e, i, s) {
                    var n, r, o, h;
                    if (
                        (l(i),
                            void 0 === (r = t._events) ?
                            ((r = t._events = Object.create(null)), (t._eventsCount = 0)) :
                            (void 0 !== r.newListener &&
                                (t.emit("newListener", e, i.listener ? i.listener : i),
                                    (r = t._events)),
                                (o = r[e])),
                            void 0 === o)
                    )
                        (o = r[e] = i), ++t._eventsCount;
                    else if (
                        ("function" == typeof o ?
                            (o = r[e] = s ? [i, o] : [o, i]) :
                            s ?
                            o.unshift(i) :
                            o.push(i),
                            (n = a(t)) > 0 && o.length > n && !o.warned)
                    ) {
                        o.warned = !0;
                        var c = new Error(
                            "Possible EventEmitter memory leak detected. " +
                            o.length +
                            " " +
                            String(e) +
                            " listeners added. Use emitter.setMaxListeners() to increase limit"
                        );
                        (c.name = "MaxListenersExceededWarning"),
                        (c.emitter = t),
                        (c.type = e),
                        (c.count = o.length),
                        (h = c),
                        console && console.warn && console.warn(h);
                    }
                    return t;
                }

                function c() {
                    if (!this.fired)
                        return (
                            this.target.removeListener(this.type, this.wrapFn),
                            (this.fired = !0),
                            0 === arguments.length ?
                            this.listener.call(this.target) :
                            this.listener.apply(this.target, arguments)
                        );
                }

                function u(t, e, i) {
                    var s = {
                            fired: !1,
                            wrapFn: void 0,
                            target: t,
                            type: e,
                            listener: i,
                        },
                        n = c.bind(s);
                    return (n.listener = i), (s.wrapFn = n), n;
                }

                function d(t, e, i) {
                    var s = t._events;
                    if (void 0 === s) return [];
                    var n = s[e];
                    return void 0 === n ? [] :
                        "function" == typeof n ?
                        i ? [n.listener || n] : [n] :
                        i ?
                        (function(t) {
                            for (var e = new Array(t.length), i = 0; i < e.length; ++i)
                                e[i] = t[i].listener || t[i];
                            return e;
                        })(n) :
                        m(n, n.length);
                }

                function p(t) {
                    var e = this._events;
                    if (void 0 !== e) {
                        var i = e[t];
                        if ("function" == typeof i) return 1;
                        if (void 0 !== i) return i.length;
                    }
                    return 0;
                }

                function m(t, e) {
                    for (var i = new Array(e), s = 0; s < e; ++s) i[s] = t[s];
                    return i;
                }

                function g(t, e, i, s) {
                    if ("function" == typeof t.on) s.once ? t.once(e, i) : t.on(e, i);
                    else {
                        if ("function" != typeof t.addEventListener)
                            throw new TypeError(
                                'The "emitter" argument must be of type EventEmitter. Received type ' +
                                typeof t
                            );
                        t.addEventListener(e, function n(r) {
                            s.once && t.removeEventListener(e, n), i(r);
                        });
                    }
                }
                Object.defineProperty(r, "defaultMaxListeners", {
                        enumerable: !0,
                        get: function() {
                            return o;
                        },
                        set: function(t) {
                            if ("number" != typeof t || t < 0 || n(t))
                                throw new RangeError(
                                    'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' +
                                    t +
                                    "."
                                );
                            o = t;
                        },
                    }),
                    (r.init = function() {
                        (void 0 !== this._events &&
                            this._events !== Object.getPrototypeOf(this)._events) ||
                        ((this._events = Object.create(null)), (this._eventsCount = 0)),
                        (this._maxListeners = this._maxListeners || void 0);
                    }),
                    (r.prototype.setMaxListeners = function(t) {
                        if ("number" != typeof t || t < 0 || n(t))
                            throw new RangeError(
                                'The value of "n" is out of range. It must be a non-negative number. Received ' +
                                t +
                                "."
                            );
                        return (this._maxListeners = t), this;
                    }),
                    (r.prototype.getMaxListeners = function() {
                        return a(this);
                    }),
                    (r.prototype.emit = function(t) {
                        for (var e = [], i = 1; i < arguments.length; i++)
                            e.push(arguments[i]);
                        var n = "error" === t,
                            r = this._events;
                        if (void 0 !== r) n = n && void 0 === r.error;
                        else if (!n) return !1;
                        if (n) {
                            var o;
                            if ((e.length > 0 && (o = e[0]), o instanceof Error)) throw o;
                            var l = new Error(
                                "Unhandled error." + (o ? " (" + o.message + ")" : "")
                            );
                            throw ((l.context = o), l);
                        }
                        var a = r[t];
                        if (void 0 === a) return !1;
                        if ("function" == typeof a) s(a, this, e);
                        else {
                            var h = a.length,
                                c = m(a, h);
                            for (i = 0; i < h; ++i) s(c[i], this, e);
                        }
                        return !0;
                    }),
                    (r.prototype.addListener = function(t, e) {
                        return h(this, t, e, !1);
                    }),
                    (r.prototype.on = r.prototype.addListener),
                    (r.prototype.prependListener = function(t, e) {
                        return h(this, t, e, !0);
                    }),
                    (r.prototype.once = function(t, e) {
                        return l(e), this.on(t, u(this, t, e)), this;
                    }),
                    (r.prototype.prependOnceListener = function(t, e) {
                        return l(e), this.prependListener(t, u(this, t, e)), this;
                    }),
                    (r.prototype.removeListener = function(t, e) {
                        var i, s, n, r, o;
                        if ((l(e), void 0 === (s = this._events))) return this;
                        if (void 0 === (i = s[t])) return this;
                        if (i === e || i.listener === e)
                            0 == --this._eventsCount ?
                            (this._events = Object.create(null)) :
                            (delete s[t],
                                s.removeListener &&
                                this.emit("removeListener", t, i.listener || e));
                        else if ("function" != typeof i) {
                            for (n = -1, r = i.length - 1; r >= 0; r--)
                                if (i[r] === e || i[r].listener === e) {
                                    (o = i[r].listener), (n = r);
                                    break;
                                }
                            if (n < 0) return this;
                            0 === n ?
                                i.shift() :
                                (function(t, e) {
                                    for (; e + 1 < t.length; e++) t[e] = t[e + 1];
                                    t.pop();
                                })(i, n),
                                1 === i.length && (s[t] = i[0]),
                                void 0 !== s.removeListener &&
                                this.emit("removeListener", t, o || e);
                        }
                        return this;
                    }),
                    (r.prototype.off = r.prototype.removeListener),
                    (r.prototype.removeAllListeners = function(t) {
                        var e, i, s;
                        if (void 0 === (i = this._events)) return this;
                        if (void 0 === i.removeListener)
                            return (
                                0 === arguments.length ?
                                ((this._events = Object.create(null)),
                                    (this._eventsCount = 0)) :
                                void 0 !== i[t] &&
                                (0 == --this._eventsCount ?
                                    (this._events = Object.create(null)) :
                                    delete i[t]),
                                this
                            );
                        if (0 === arguments.length) {
                            var n,
                                r = Object.keys(i);
                            for (s = 0; s < r.length; ++s)
                                "removeListener" !== (n = r[s]) && this.removeAllListeners(n);
                            return (
                                this.removeAllListeners("removeListener"),
                                (this._events = Object.create(null)),
                                (this._eventsCount = 0),
                                this
                            );
                        }
                        if ("function" == typeof(e = i[t])) this.removeListener(t, e);
                        else if (void 0 !== e)
                            for (s = e.length - 1; s >= 0; s--) this.removeListener(t, e[s]);
                        return this;
                    }),
                    (r.prototype.listeners = function(t) {
                        return d(this, t, !0);
                    }),
                    (r.prototype.rawListeners = function(t) {
                        return d(this, t, !1);
                    }),
                    (r.listenerCount = function(t, e) {
                        return "function" == typeof t.listenerCount ?
                            t.listenerCount(e) :
                            p.call(t, e);
                    }),
                    (r.prototype.listenerCount = p),
                    (r.prototype.eventNames = function() {
                        return this._eventsCount > 0 ? e(this._events) : [];
                    });
            },
            723: (t, e, i) => {
                "use strict";
                i.r(e);
            },
            905: (t, e, i) => {
                "use strict";
                i.r(e);
            },
            356: (t, e, i) => {
                "use strict";
                e.TypedEmitter = i(100).EventEmitter;
            },
            727: (t, e, i) => {
                "use strict";
                i.d(e, {
                    S: () => s
                });
                class s {
                    static getElementByStringSelector(t, e = document) {
                        if ("string" == typeof t) {
                            const i = e.querySelector(t);
                            if (i && null !== i) return i;
                        }
                        if (s.isHTMLElement(t)) return t;
                    }
                    static isHTMLElement(t, e = "Element") {
                        if (!t) return !1;
                        let i = t.__proto__;
                        for (; null !== i;) {
                            if (i.constructor.name === e) return !0;
                            i = i.__proto__;
                        }
                        return !1;
                    }
                    static getElementsInContainer(t, e) {
                        return "string" == typeof e && t && null !== t ? [...t.querySelectorAll(e)] :
                            "object" == typeof e ? [...e] :
                            void 0;
                    }
                    static removeElements(t) {
                        if (t.length)
                            for (const e of t) e.remove();
                    }
                    static cleanElementsVisibility(t) {
                        if (t.length)
                            for (const e of t)
                                (e.style.display = null),
                                (e.style.visibility = null),
                                (e.style.opacity = null);
                    }
                    static cleanElementsTransform(t) {
                        if (t.length)
                            for (const e of t)
                                (e.style.transform = null), (e.style.transformStyle = null);
                    }
                    static setElementsDisplay(t, e) {
                        if (t.length)
                            for (const i of t) i.style.display = e ? null : "none";
                    }
                    static setLaneId(t, e) {
                        if (t) return (t.dataset.laneId = e.toString());
                    }
                    static getLaneId(t) {
                        if (t) return parseInt(t.dataset.laneId);
                    }
                    static cloneElements(t, e = 1, i = !1, s) {
                        const n = [];
                        if (t.length)
                            for (let r = 0; r < e; r++) {
                                const e = document.createComment(" ### Clones ### ");
                                t[0].parentNode.appendChild(e);
                                for (let e = 0; e < t.length; e++) {
                                    const r = t[e].cloneNode(!0);
                                    (r.dataset.itemCloneId =
                                        "number" == typeof s || "string" == typeof s ?
                                        e.toString() :
                                        "true"),
                                    r.removeAttribute("id"),
                                        r.removeAttribute("data-item-id"),
                                        i && (r.style.display = "none"),
                                        t[e].parentNode.appendChild(r),
                                        n.push(r);
                                }
                            }
                        return n;
                    }
                    static getComments(t) {
                        const e = [],
                            i = function(t) {
                                if (
                                    (t.nodeType == Node.COMMENT_NODE && e.push(t),
                                        t.childNodes && t.childNodes.length)
                                )
                                    for (var s = 0; s < t.childNodes.length; s++)
                                        i(t.childNodes[s]);
                            };
                        return i(t), e;
                    }
                    static getIndexItemLooped(t) {
                        return "string" == typeof t.dataset.itemCloneId &&
                            "true" !== t.dataset.itemCloneId ?
                            parseInt(t.dataset.itemCloneId) :
                            parseInt(t.dataset.itemId);
                    }
                }
            },
            948: (t, e, i) => {
                "use strict";
                i.d(e, {
                    E: () => o
                });
                var s = i(454);
                const n = {
                    init: !0,
                    listElementsSelector: '[data-arts-infinite-list="item"]',
                    direction: "vertical",
                    mapWheelEventYtoX: !0,
                    autoCenterFirstItem: !1,
                    scroll: {
                        inverse: {
                            mouse: !1,
                            touch: !1
                        },
                        easing: {
                            mouse: 0.1,
                            touch: 0.2
                        },
                        speed: {
                            mouse: 1,
                            touch: 1
                        },
                        maxDelta: {
                            mouse: 80,
                            touch: 80
                        },
                        snapDelay: {
                            mouse: 0.3,
                            touch: 0.6
                        },
                    },
                    plugins: {
                        marquee: !1,
                        scroll: !0,
                        renderer: !0,
                        progressEffect: !1,
                        opacityEffect: !1,
                    },
                    matchMedia: !1,
                    multiLane: !1,
                    loop: !0,
                    autoClone: !0,
                    minCloneLoopRounds: 0,
                    maxCloneLoopRounds: 32,
                    resizeObserver: {
                        watchListElements: !1,
                        debounceTime: 300
                    },
                    focusObserver: !1,
                    toggleViewClass: !1,
                    toggleEnabledClass: "initialized",
                    toggleReadyClass: "ready",
                };
                var r = i(727);
                class o {
                    constructor({
                        container: t,
                        attributeSelector: e = "data-arts-infinite-list-options",
                        options: i,
                    }) {
                        (this._data = n),
                        r.S.isHTMLElement(t) &&
                            this._transformOptions({
                                container: t,
                                attributeSelector: e,
                                options: i,
                            });
                    }
                    get data() {
                        return this._data;
                    }
                    set data(t) {
                        this._data = t;
                    }
                    _transformOptions({
                        container: t,
                        attributeSelector: e,
                        options: i,
                    }) {
                        if (!t) return {};
                        let r = {};
                        if (
                            (i &&
                                n &&
                                ((r = s(n, i)),
                                    (r = o.transformPluginOptions(r)),
                                    r.scroll && (r.scroll = o.transformScrollOptions(r.scroll))),
                                e)
                        ) {
                            let i;
                            (i =
                                "DATA" === e ?
                                (function(t, e = {
                                    separator: "-",
                                    pattern: /^/
                                }) {
                                    let i = {};
                                    var s;
                                    return (
                                        void 0 === e.separator && (e.separator = "-"),
                                        Array.prototype.slice
                                        .call(t.attributes)
                                        .filter(
                                            ((s = e.pattern),
                                                function(t) {
                                                    let e;
                                                    return (
                                                        (e = /^data\-/.test(t.name)),
                                                        void 0 === s ? e : e && s.test(t.name.slice(5))
                                                    );
                                                })
                                        )
                                        .forEach(function(t) {
                                            t.name
                                                .slice(5)
                                                .split(e.separator)
                                                .reduce(function(e, i, s, n) {
                                                    return "data" === i ?
                                                        e :
                                                        (s === n.length - 1 ?
                                                            (e[i] = t.value) :
                                                            (e[i] = e[i] || {}),
                                                            e[i]);
                                                }, i);
                                        }),
                                        i
                                    );
                                })(t) :
                                o.parseOptionsStringObject(t.getAttribute(e))),
                            i &&
                                0 !== Object.keys(i).length &&
                                ((i = o.transformPluginOptions(i)), (r = s(r, i)));
                        }
                        this.data = r;
                    }
                    static parseOptionsStringObject(t) {
                        let e = {};
                        if (!t) return e;
                        try {
                            e = JSON.parse(o.convertStringToJSON(t));
                        } catch (e) {
                            console.warn(`${t} is not a valid parameters object`);
                        }
                        return e;
                    }
                    static convertStringToJSON(t) {
                        if (t)
                            return t
                                .replace(/'/g, '"')
                                .replace(/(\w+:)|(\w+ :)/g, function(t) {
                                    return '"' + t.substring(0, t.length - 1) + '":';
                                });
                    }
                    static transformPluginOptions(t) {
                        return (
                            "mapWheelEventYtoX" in t &&
                            t.mapWheelEventYtoX &&
                            "horizontal" !== t.direction &&
                            (t.mapWheelEventYtoX = !1),
                            t
                        );
                    }
                    static transformScrollOptions(t) {
                        return (
                            "number" == typeof t.easing &&
                            (t.easing = {
                                mouse: t.easing,
                                touch: t.easing
                            }),
                            "number" == typeof t.speed &&
                            (t.speed = {
                                mouse: t.speed,
                                touch: t.speed
                            }),
                            "boolean" == typeof t.inverse &&
                            (t.inverse = {
                                mouse: t.inverse,
                                touch: t.inverse
                            }),
                            "number" == typeof t.maxDelta &&
                            (t.maxDelta = {
                                mouse: t.maxDelta,
                                touch: t.maxDelta
                            }),
                            t
                        );
                    }
                    static getScrollOption({
                        scrollOptions: t,
                        option: e,
                        event: i = {
                            x: 0,
                            y: 0,
                            isDragging: !1
                        },
                    }) {
                        const s = t[e];
                        let n;
                        return (
                            "number" == typeof s && (n = s),
                            "object" == typeof s &&
                            (i.isDragging ?
                                "touch" in s && (n = s.touch) :
                                "mouse" in s && (n = s.mouse)),
                            "number" != typeof n && (n = !0 === n ? 1 : 0),
                            "speed" === e &&
                            (0 === n || ("withSpeed" in i && !1 === i.withSpeed)) &&
                            (n = 1),
                            "easing" === e &&
                            (0 === n || ("withEasing" in i && !1 === i.withEasing)) &&
                            (n = 1),
                            n
                        );
                    }
                }
            },
            199: (t, e, i) => {
                "use strict";
                i.d(e, {
                    v: () => o
                });
                var s = i(356),
                    n = i(454),
                    r = i(727);
                class o extends s.TypedEmitter {
                    constructor({
                        autoLoad: t = !0,
                        container: e,
                        options: i,
                        controller: s,
                        view: r,
                        config: o,
                        defaults: l,
                    } = {}) {
                        super(),
                            (this._enabled = !1),
                            (this._initialized = !1),
                            e && (this.container = e),
                            i && (this.options = i),
                            s && (this.controller = s),
                            r && (this.view = r),
                            o &&
                            ((this.config = o),
                                l &&
                                "object" == typeof l &&
                                ((this.defaults = l),
                                    (this.config = n(this.defaults, this.config)))),
                            this._attachListeners(),
                            t && this.init();
                    }
                    init() {
                        this.enabled = !0;
                    }
                    destroy() {
                        this.enabled = !1;
                    }
                    toggle(t) {
                        t ? this.enabled || this.enable() : this.enabled && this.disable();
                    }
                    enable() {
                        this.enabled || this.init();
                    }
                    disable() {
                        this.enabled && this.destroy();
                    }
                    getConfigOption(t, e) {
                        let i = this.config[t];
                        return (
                            e &&
                            "string" == typeof t &&
                            "object" == typeof this.config &&
                            "multiLane" in this.config &&
                            "object" == typeof this.config.multiLane &&
                            e in this.config.multiLane &&
                            this.config.multiLane[e] &&
                            (i = this.config.multiLane[e][t]),
                            i
                        );
                    }
                    set enabled(t) {
                        this._enabled = t;
                    }
                    get enabled() {
                        return this._enabled;
                    }
                    set controller(t) {
                        this._controller = t;
                    }
                    get controller() {
                        return this._controller;
                    }
                    set view(t) {
                        this._view = t;
                    }
                    get view() {
                        return this._view;
                    }
                    set config(t) {
                        this._config = t;
                    }
                    get config() {
                        return this._config;
                    }
                    set defaults(t) {
                        this._defaults = t;
                    }
                    get defaults() {
                        return this._defaults;
                    }
                    set initialized(t) {
                        this._initialized = t;
                    }
                    get initialized() {
                        return this._initialized;
                    }
                    _attachListeners() {
                        this.addListener("init", this._onInit.bind(this)),
                            this.addListener("destroy", this._onDestroy.bind(this)),
                            this.addListener("enable", this._onEnable.bind(this)),
                            this.addListener("disable", this._onDisable.bind(this));
                    }
                    _detachListeners() {
                        this.removeAllListeners();
                    }
                    _onInit() {
                        this.init();
                    }
                    _onDestroy() {
                        this.destroy();
                    }
                    _onEnable() {
                        this.enable();
                    }
                    _onDisable() {
                        this.disable();
                    }
                    _attachToggleViewEvents() {
                        document.addEventListener(
                            "arts/container/visibility",
                            this._onToggleVisibility.bind(this)
                        );
                    }
                    _detachToggleViewEvents() {
                        document.removeEventListener(
                            "arts/container/visibility",
                            this._onToggleVisibility.bind(this)
                        );
                    }
                    _onToggleVisibility(t) {
                        "detail" in t &&
                            "object" == typeof t.detail &&
                            "visible" in t.detail &&
                            "container" in t.detail &&
                            r.S.isHTMLElement(t.detail.container) &&
                            t.detail.container.contains(this.container) &&
                            (t.detail.visible ? this.enable() : this.disable());
                    }
                }
            },
        },
        s = {};

    function n(t) {
        var e = s[t];
        if (void 0 !== e) return e.exports;
        var r = (s[t] = {
            exports: {}
        });
        return i[t](r, r.exports, n), r.exports;
    }
    (n.m = i),
    (n.n = (t) => {
        var e = t && t.__esModule ? () => t.default : () => t;
        return n.d(e, {
            a: e
        }), e;
    }),
    (n.d = (t, e) => {
        for (var i in e)
            n.o(e, i) &&
            !n.o(t, i) &&
            Object.defineProperty(t, i, {
                enumerable: !0,
                get: e[i]
            });
    }),
    (n.f = {}),
    (n.e = (t) =>
        Promise.all(Object.keys(n.f).reduce((e, i) => (n.f[i](t, e), e), []))),
    (n.u = (t) =>
        ({
            190: "plugin.progress-effect",
            247: "plugin.autoplay",
            324: "plugin.renderer",
            430: "plugin.scroll",
            461: "plugin.opacity-effect",
            532: "plugin.marquee",
            934: "plugin.speed-effect",
        } [t] + ".min.js")),
    (n.miniCssF = (t) => {}),
    (n.g = (function() {
        if ("object" == typeof globalThis) return globalThis;
        try {
            return this || new Function("return this")();
        } catch (t) {
            if ("object" == typeof window) return window;
        }
    })()),
    (n.o = (t, e) => Object.prototype.hasOwnProperty.call(t, e)),
    (t = {}),
    (e = "ArtsInfiniteList:"),
    (n.l = (i, s, r, o) => {
        if (t[i]) t[i].push(s);
        else {
            var l, a;
            if (void 0 !== r)
                for (
                    var h = document.getElementsByTagName("script"), c = 0; c < h.length; c++
                ) {
                    var u = h[c];
                    if (
                        u.getAttribute("src") == i ||
                        u.getAttribute("data-webpack") == e + r
                    ) {
                        l = u;
                        break;
                    }
                }
            l ||
                ((a = !0),
                    ((l = document.createElement("script")).charset = "utf-8"),
                    (l.timeout = 120),
                    n.nc && l.setAttribute("nonce", n.nc),
                    l.setAttribute("data-webpack", e + r),
                    (l.src = i)),
                (t[i] = [s]);
            var d = (e, s) => {
                    (l.onerror = l.onload = null), clearTimeout(p);
                    var n = t[i];
                    if (
                        (delete t[i],
                            l.parentNode && l.parentNode.removeChild(l),
                            n && n.forEach((t) => t(s)),
                            e)
                    )
                        return e(s);
                },
                p = setTimeout(
                    d.bind(null, void 0, {
                        type: "timeout",
                        target: l
                    }),
                    12e4
                );
            (l.onerror = d.bind(null, l.onerror)),
            (l.onload = d.bind(null, l.onload)),
            a && document.head.appendChild(l);
        }
    }),
    (n.r = (t) => {
        "undefined" != typeof Symbol &&
            Symbol.toStringTag &&
            Object.defineProperty(t, Symbol.toStringTag, {
                value: "Module"
            }),
            Object.defineProperty(t, "__esModule", {
                value: !0
            });
    }),
    (() => {
        var t;
        n.g.importScripts && (t = n.g.location + "");
        var e = n.g.document;
        if (!t && e && (e.currentScript && (t = e.currentScript.src), !t)) {
            var i = e.getElementsByTagName("script");
            if (i.length)
                for (var s = i.length - 1; s > -1 && !t;) t = i[s--].src;
        }
        if (!t)
            throw new Error(
                "Automatic publicPath is not supported in this browser"
            );
        (t = t
            .replace(/#.*$/, "")
            .replace(/\?.*$/, "")
            .replace(/\/[^\/]+$/, "/")),
        (n.p = t);
    })(),
    (() => {
        var t = {
            179: 0
        };
        n.f.j = (e, i) => {
            var s = n.o(t, e) ? t[e] : void 0;
            if (0 !== s)
                if (s) i.push(s[2]);
                else {
                    var r = new Promise((i, n) => (s = t[e] = [i, n]));
                    i.push((s[2] = r));
                    var o = n.p + n.u(e),
                        l = new Error();
                    n.l(
                        o,
                        (i) => {
                            if (n.o(t, e) && (0 !== (s = t[e]) && (t[e] = void 0), s)) {
                                var r = i && ("load" === i.type ? "missing" : i.type),
                                    o = i && i.target && i.target.src;
                                (l.message =
                                    "Loading chunk " + e + " failed.\n(" + r + ": " + o + ")"),
                                (l.name = "ChunkLoadError"),
                                (l.type = r),
                                (l.request = o),
                                s[1](l);
                            }
                        },
                        "chunk-" + e,
                        e
                    );
                }
        };
        var e = (e, i) => {
                var s,
                    r,
                    [o, l, a] = i,
                    h = 0;
                if (o.some((e) => 0 !== t[e])) {
                    for (s in l) n.o(l, s) && (n.m[s] = l[s]);
                    a && a(n);
                }
                for (e && e(i); h < o.length; h++)
                    (r = o[h]), n.o(t, r) && t[r] && t[r][0](), (t[r] = 0);
            },
            i = (self.webpackChunkArtsInfiniteList =
                self.webpackChunkArtsInfiniteList || []);
        i.forEach(e.bind(null, 0)), (i.push = e.bind(null, i.push.bind(i)));
    })();
    var r = {};
    (() => {
        "use strict";
        n.d(r, {
            default: () => z
        });
        var t = n(356),
            e = n(948),
            i = n(727),
            s = n(454);
        class o {
            constructor({
                container: t,
                pluginOptions: e,
                geometry: i,
                items: s,
                loop: n,
                elements: r,
                scroller: o,
                view: l,
                progress: a,
                position: h,
            }) {
                t && (this.container = t),
                    e && (this.pluginOptions = e),
                    i && (this.geometry = i),
                    r && (this.elements = r),
                    s && (this.items = s),
                    n && (this.loop = n),
                    o && (this.scroller = o),
                    h && (this.position = h),
                    a && (this.progress = a),
                    l && (this.view = l);
            }
            get container() {
                return this._container;
            }
            set container(t) {
                this._container = t;
            }
            get scroller() {
                return this._scroller;
            }
            set scroller(t) {
                this._scroller = t;
            }
            get pluginOptions() {
                return this._pluginOptions;
            }
            set pluginOptions(t) {
                this._pluginOptions = t;
            }
            get view() {
                return this._view;
            }
            set view(t) {
                this._view = t;
            }
            get geometry() {
                return this._geometry;
            }
            set geometry(t) {
                this._geometry = t;
            }
            get items() {
                return this._items;
            }
            set items(t) {
                this._items = t;
            }
            get elements() {
                return this._elements;
            }
            set elements(t) {
                this._elements = t;
            }
            get loop() {
                return this._loop;
            }
            set loop(t) {
                this._loop = t;
            }
            get progress() {
                return this._progress;
            }
            set progress(t) {
                this._progress = t;
            }
            get position() {
                return this._position;
            }
            set position(t) {
                this._position = t;
            }
        }
        class l extends o {
            constructor({
                container: t
            }) {
                super({
                        container: t
                    }),
                    (this._visibleArea = {
                        width: 0,
                        height: 0
                    }),
                    (this._scrollableArea = {
                        width: 0,
                        height: 0
                    }),
                    (this._difference = {
                        horizontal: 0,
                        vertical: 0
                    });
            }
            get visibleArea() {
                return this._visibleArea;
            }
            set visibleArea(t) {
                this._visibleArea = t;
            }
            get scrollableArea() {
                return this._scrollableArea;
            }
            set scrollableArea(t) {
                this._scrollableArea = t;
            }
            get difference() {
                return this._difference;
            }
            set difference(t) {
                this._difference = t;
            }
            get rect() {
                return this._rect;
            }
            set rect(t) {
                this._rect = t;
            }
            init() {
                return new Promise((t) => {
                    this._updateScrollableArea()
                        .then(() => this._updateDifference())
                        .then(() => this._updateRect())
                        .then(() => t(!0));
                });
            }
            update() {
                return new Promise((t) => {
                    this._updateScrollableArea()
                        .then(() => this._updateVisibleArea())
                        .then(() => this._updateDifference())
                        .then(() => this._updateRect())
                        .then(() => t(!0));
                });
            }
            _updateScrollableArea() {
                return new Promise((t) => {
                    const {
                        scrollWidth: e,
                        scrollHeight: i
                    } = this.container;
                    (this.scrollableArea = {
                        width: e,
                        height: i
                    }), t(!0);
                });
            }
            _updateVisibleArea() {
                return new Promise((t) => {
                    const {
                        offsetWidth: e,
                        offsetHeight: i
                    } = this.container;
                    (this.visibleArea = {
                        width: e,
                        height: i
                    }), t(!0);
                });
            }
            _updateDifference() {
                return new Promise((t) => {
                    (this.difference = {
                        horizontal: Math.max(
                            0,
                            this.scrollableArea.width - this.visibleArea.width
                        ),
                        vertical: Math.max(
                            0,
                            this.scrollableArea.height - this.visibleArea.height
                        ),
                    }),
                    t(!0);
                });
            }
            _updateRect() {
                return new Promise((t) => {
                    (this.rect = this.container.getBoundingClientRect()), t(!0);
                });
            }
        }

        function a(t, e, i) {
            return 0 === t && 0 === e ? i : Math.min(Math.max(e, i), t);
        }

        function h(t, e, i) {
            return i * (t - e) + e;
        }

        function c(t, e, i) {
            return ((((i - t) % (e - t)) + (e - t)) % (e - t)) + t;
        }
        class u extends o {
            constructor({
                scrollOptions: t,
                geometry: e,
                pluginOptions: i
            }) {
                super({
                        pluginOptions: i,
                        geometry: e
                    }),
                    (this._event = {
                        x: 0,
                        y: 0,
                        deltaX: 0,
                        deltaY: 0,
                        isDragging: !1,
                        withEasing: !0,
                        withSpeed: !0,
                    }),
                    (this._current = {
                        x: 0,
                        y: 0
                    }),
                    (this._last = {
                        x: 0,
                        y: 0
                    }),
                    (this._actual = {
                        x: 0,
                        y: 0
                    }),
                    (this._virtual = {
                        x: 0,
                        y: 0
                    }),
                    (this._velocity = 0),
                    (this._direction = "idle"),
                    (this._handlers = {
                        timeout: this._onTimeout.bind(this)
                    }),
                    (this.scrollOptions = t);
            }
            reset() {
                Object.assign(this.current, {
                    x: this.last.x,
                    y: this.last.y
                });
            }
            update() {
                this._updateLast(),
                    this._updateVelocity(),
                    (this.event.x = this.last.x),
                    (this.event.y = this.last.y),
                    this._updateDirection(),
                    this._updateActual(),
                    this._updateVirtual();
            }
            transform(t) {
                this._updateEvent(t),
                    this._transformDirection(),
                    this._transformDelta(),
                    this._updateScrolling();
            }
            set velocity(t) {
                this._velocity = parseFloat(t.toFixed(3));
            }
            get velocity() {
                return this._velocity;
            }
            set direction(t) {
                this._direction = t;
            }
            get direction() {
                return this._direction;
            }
            _updateDirection() {
                0 === this.velocity && (this.direction = "idle"),
                    this.velocity > 0 && (this.direction = "backward"),
                    this.velocity < 0 && (this.direction = "forward");
            }
            _updateVelocity() {
                let t = 0;
                const i = this.velocity,
                    s = e.E.getScrollOption({
                        option: "maxDelta",
                        scrollOptions: this.scrollOptions,
                        event: this.event,
                    }),
                    n = e.E.getScrollOption({
                        option: "easing",
                        scrollOptions: this.scrollOptions,
                        event: this.event,
                    });
                e.E.getScrollOption({
                        option: "speed",
                        scrollOptions: this.scrollOptions,
                        event: this.event,
                    }),
                    e.E.getScrollOption({
                        option: "inverse",
                        scrollOptions: this.scrollOptions,
                        event: this.event,
                    }),
                    (t =
                        "horizontal" === this.pluginOptions.direction ?
                        this.current.x - this.last.x :
                        this.current.y - this.last.y),
                    t >= 0 &&
                    t > i &&
                    (this.event.zeroVelocity ?
                        (this.velocity = h(0, i, n)) :
                        (this.velocity = a(1, 0, (t / s) * 1 * n))),
                    t < 0 &&
                    t < i &&
                    (this.event.zeroVelocity ?
                        (this.velocity = h(0, i, n)) :
                        (this.velocity = a(0, -1, (t / s) * 1 * n)));
            }
            set event(t) {
                this._event = t;
            }
            get event() {
                return this._event;
            }
            _updateEvent(t) {
                if (
                    (Object.assign(this.event, t),
                        t.hasOwnProperty("withEasing") || (this.event.withEasing = !0),
                        !t.hasOwnProperty("withSpeed"))
                ) {
                    this.event.withSpeed = !0;
                    const t = e.E.getScrollOption({
                            option: "speed",
                            scrollOptions: this.scrollOptions,
                            event: this.event,
                        }),
                        i = e.E.getScrollOption({
                            option: "easing",
                            scrollOptions: this.scrollOptions,
                            event: this.event,
                        });
                    (this.event.deltaX = this.event.deltaX * (t + i)),
                    (this.event.deltaY = this.event.deltaY * (t + i));
                }
                this.scrolling = !0;
            }
            set timer(t) {
                this._timer = t;
            }
            get timer() {
                return this._timer;
            }
            _updateTimer() {
                this.timeout > 0 ?
                    (null !== this.timer && this._clearTimer(),
                        (this.timer = gsap.delayedCall(
                            this.timeout / 1e3,
                            this._handlers.timeout
                        ))) :
                    (this._clearTimer(), this._onTimeout());
            }
            _clearTimer() {
                this.timer && this.timer.kill(), (this.timer = null);
            }
            set timeout(t) {
                this._timeout = t;
            }
            get timeout() {
                return this._timeout;
            }
            _updateTimeout() {
                const t = e.E.getScrollOption({
                        option: "speed",
                        scrollOptions: this.scrollOptions,
                        event: this.event,
                    }),
                    i = e.E.getScrollOption({
                        option: "easing",
                        scrollOptions: this.scrollOptions,
                        event: this.event,
                    });
                this.timeout = 1e3 * Math.abs(t + i);
            }
            _onTimeout() {
                this.scrolling = !1;
            }
            set scrolling(t) {
                this._scrolling = t;
            }
            get scrolling() {
                return this._scrolling;
            }
            _updateScrolling() {
                this._updateTimeout(), this._updateTimer();
            }
            get actual() {
                return this._actual;
            }
            set actual(t) {
                this._actual = t;
            }
            _updateActual() {
                const {
                    x: t,
                    y: e
                } = this.event,
                    i = this.geometry.visibleArea.width,
                    s = this.geometry.visibleArea.height;
                let n = -c(-i, i, t),
                    r = -c(-s, s, e);
                (n = parseFloat(n.toFixed(3))),
                (r = parseFloat(r.toFixed(3))),
                (this.actual.x = n),
                (this.actual.y = r);
            }
            get virtual() {
                return this._virtual;
            }
            set virtual(t) {
                this._virtual = t;
            }
            _updateVirtual() {
                const {
                    x: t,
                    y: e
                } = this.event,
                    i = this.geometry.scrollableArea.width,
                    s = this.geometry.scrollableArea.height;
                let n = -c(-i, i, t),
                    r = -c(-s, s, e);
                (n = parseFloat(n.toFixed(3))),
                (r = parseFloat(r.toFixed(3))),
                (this.virtual.x = n),
                (this.virtual.y = r);
            }
            set current(t) {
                this._current = t;
            }
            get current() {
                return this._current;
            }
            set last(t) {
                this._last = t;
            }
            get last() {
                return this._last;
            }
            _updateLast() {
                let t = e.E.getScrollOption({
                    option: "easing",
                    scrollOptions: this.scrollOptions,
                    event: this.event,
                });
                (this.last.x = h(this.current.x, this.last.x, t)),
                (this.last.y = h(this.current.y, this.last.y, t));
            }
            set scrollOptions(t) {
                this._scrollOptions = t;
            }
            get scrollOptions() {
                return this._scrollOptions;
            }
            _transformDirection() {
                e.E.getScrollOption({
                        option: "inverse",
                        scrollOptions: this.scrollOptions,
                        event: this.event,
                    }) &&
                    ((this.event.x = -this.event.x),
                        (this.event.y = -this.event.y),
                        (this.event.deltaX = -this.event.deltaX),
                        (this.event.deltaY = -this.event.deltaY));
            }
            _transformDelta() {
                const t = e.E.getScrollOption({
                    option: "maxDelta",
                    scrollOptions: this.scrollOptions,
                    event: this.event,
                });
                (this.current.x += a(t, -t, this.event.deltaX)),
                (this.current.y += a(t, -t, this.event.deltaY)),
                this.pluginOptions.loop || this._limitByContainerDimensions();
            }
            _limitByContainerDimensions() {
                this.current.x >= 0 && (this.current.x = 0),
                    this.current.y >= 0 && (this.current.y = 0),
                    this.current.x <= -this.geometry.difference.horizontal &&
                    (this.current.x = -this.geometry.difference.horizontal),
                    this.pluginOptions.mapWheelEventYtoX ?
                    this.current.y <= -this.geometry.difference.horizontal &&
                    (this.current.y = -this.geometry.difference.horizontal) :
                    this.current.y <= -this.geometry.difference.vertical &&
                    (this.current.y = -this.geometry.difference.vertical);
            }
        }
        class d extends o {
            constructor({
                element: t,
                geometry: e
            }) {
                super({
                        geometry: e
                    }),
                    (this._rect = {
                        top: 0,
                        left: 0,
                        width: 0,
                        height: 0
                    }),
                    (this._limit = {
                        translate: {
                            min: {
                                x: 0,
                                y: 0,
                                z: 0
                            },
                            max: {
                                x: 0,
                                y: 0,
                                z: 0
                            }
                        },
                    }),
                    (this.element = t);
            }
            init() {
                return new Promise((t) => {
                    this._updateRect()
                        .then(() => this._updateLimit())
                        .then(() => t(!0));
                });
            }
            update() {
                return new Promise((t) => {
                    this._cleanTransform()
                        .then(() => this._updateRect())
                        .then(() => this._updateLimit())
                        .then(() => t(!0));
                });
            }
            set element(t) {
                this._element = t;
            }
            get element() {
                return this._element;
            }
            set rect(t) {
                this._rect = t;
            }
            get rect() {
                return this._rect;
            }
            _updateRect() {
                return new Promise((t) => {
                    const {
                        offsetTop: e,
                        offsetLeft: i,
                        offsetWidth: s,
                        offsetHeight: n,
                    } = this.element;
                    (this.rect = {
                        top: e,
                        left: i,
                        width: s,
                        height: n
                    }), t(!0);
                });
            }
            set limit(t) {
                this.limit = t;
            }
            get limit() {
                return this._limit;
            }
            _updateLimit() {
                return new Promise((t) => {
                    this._updateLimitTranslation().then(() => t(!0));
                });
            }
            _updateLimitTranslation() {
                return new Promise((t) => {
                    const {
                        width: e,
                        height: i,
                        left: s,
                        top: n
                    } = this.rect;
                    (this.limit.translate = {
                        min: {
                            x: -e - s,
                            y: -i - n,
                            z: 0
                        },
                        max: {
                            x: this.geometry.visibleArea.width - s + this.geometry.rect.left,
                            y: this.geometry.visibleArea.height - n,
                            z: 0,
                        },
                    }),
                    t(!0);
                });
            }
            _cleanTransform() {
                return new Promise((t) => {
                    i.S.cleanElementsTransform([this.element]), t(!0);
                });
            }
        }
        class p extends o {
            constructor({
                laneId: t,
                container: e,
                pluginOptions: i,
                geometry: s,
                view: n,
                controller: r,
            }) {
                super({
                        container: e,
                        geometry: s,
                        pluginOptions: i,
                        view: n
                    }),
                    (this._all = []),
                    (this._original = []),
                    (this._originalTotalDimension = 0),
                    (this._clones = []),
                    (this._loopRounds = 0),
                    (this.controller = r),
                    (this.laneId = t);
            }
            get all() {
                return this._all;
            }
            set all(t) {
                this._all = t;
            }
            get laneId() {
                return this._laneId;
            }
            set laneId(t) {
                this._laneId = t;
            }
            get original() {
                return this._original;
            }
            set original(t) {
                this._original = t;
            }
            _updateOriginal() {
                return new Promise((t) => {
                    (this.original = i.S.getElementsInContainer(
                        this.container,
                        this.pluginOptions.listElementsSelector
                    )),
                    t(!0);
                });
            }
            get clones() {
                return this._clones;
            }
            set clones(t) {
                this._clones = t;
            }
            _updateClones() {
                return new Promise((t) => {
                    const e = this._cloneElements();
                    e.length ?
                        ((this.clones = [...this.clones, ...e]),
                            this._addCloneItems()
                            .then(() => this.geometry.update())
                            .then(() => {
                                this.controller.emit("clonesAdded", {
                                        indexLane: parseInt(this.laneId.toString()),
                                        original: this.original,
                                        clones: e,
                                    }),
                                    t(!0);
                            })) :
                        t(!0);
                });
            }
            get loopRounds() {
                return this._loopRounds;
            }
            set loopRounds(t) {
                this._loopRounds = t;
            }
            _updateLoopRounds() {
                if (0 === this.originalTotalDimension)
                    return void(this.loopRounds = 0);
                let t = 0;
                const e = this.original.length - 1;
                this.original[0] &&
                    this.original[e] &&
                    (t =
                        "horizontal" === this.pluginOptions.direction ?
                        this.geometry.visibleArea.width +
                        this.original[0].offsetWidth +
                        this.original[e].offsetWidth :
                        this.geometry.visibleArea.height +
                        this.original[0].offsetHeight +
                        this.original[e].offsetHeight),
                    (this.loopRounds = Math.ceil(t / this.originalTotalDimension) - 1),
                    "number" == typeof this.pluginOptions.minCloneLoopRounds &&
                    (this.loopRounds = Math.max(
                        this.loopRounds,
                        this.pluginOptions.minCloneLoopRounds
                    )),
                    "number" == typeof this.pluginOptions.maxCloneLoopRounds &&
                    this.loopRounds > this.pluginOptions.maxCloneLoopRounds &&
                    (this.loopRounds !== 1 / 0 &&
                        console.warn(
                            `Reached maximum limit of ${this.pluginOptions.maxCloneLoopRounds} loop rounds for auto cloning. Required: ${this.loopRounds} loop rounds`
                        ),
                        (this.loopRounds = this.pluginOptions.maxCloneLoopRounds));
            }
            get originalTotalDimension() {
                return this._originalTotalDimension;
            }
            set originalTotalDimension(t) {
                this._originalTotalDimension = t;
            }
            _updateOriginalTotalDimension() {
                return new Promise((t) => {
                    this.originalTotalDimension = 0;
                    for (const t of this.original)
                        this.originalTotalDimension +=
                        "horizontal" === this.pluginOptions.direction ?
                        t.offsetWidth :
                        t.offsetHeight;
                    t(!0);
                });
            }
            init() {
                return new Promise((t) => {
                    this._updateOriginal()
                        .then(() => this._updateOriginalTotalDimension())
                        .then(() => this._addOriginalItems())
                        .then(() => this._handleLoopClones())
                        .then(() => t(!0));
                });
            }
            destroy() {
                this._removeLoopClones(),
                    this._removeComments(),
                    i.S.cleanElementsVisibility(this.original),
                    i.S.cleanElementsTransform(this.original);
            }
            enable() {
                i.S.setElementsDisplay(this.clones, !0);
            }
            disable() {
                i.S.cleanElementsVisibility(this.original),
                    i.S.cleanElementsTransform(this.original),
                    i.S.setElementsDisplay(this.clones, !1);
            }
            update() {
                return new Promise((t) => {
                    const e = [];
                    for (let t = 0; t < this.all.length; t++)
                        e.push(this.all[t].update());
                    Promise.all(e)
                        .then(() => this._updateOriginalTotalDimension())
                        .then(() => this._handleLoopClones())
                        .then(() => {
                            i.S.setElementsDisplay(this.clones, this._isMatchMedia()), t(!0);
                        });
                });
            }
            _handleLoopClones() {
                return new Promise((t) => {
                    if (this.pluginOptions.autoClone && this._isMatchMedia()) {
                        const e = this.loopRounds;
                        this._updateLoopRounds(),
                            this.loopRounds > e ?
                            this._updateClones().then(() => t(!0)) :
                            t(!0);
                    } else t(!0);
                });
            }
            _removeLoopClones() {
                this.all.forEach((t, e) => {
                        this.clones.includes(t.element) && delete this.all[e];
                    }),
                    (this.all = this.all.filter(Boolean)),
                    i.S.removeElements(this.clones),
                    (this.clones = []),
                    (this.loopRounds = 0);
            }
            _removeComments() {
                this.original[0] &&
                    this.original[0].parentNode &&
                    i.S.getComments(this.original[0].parentNode).forEach((t) =>
                        t.remove()
                    );
            }
            _add(t) {
                return new Promise((e) => {
                    const i = this.all.length,
                        s = new d({
                            element: t,
                            geometry: this.geometry
                        });
                    (this.all[i] = s),
                    s.init().then(() => {
                        (this.view.current[this.laneId].items[i] = this.view.last[
                            this.laneId
                        ].items[i] = {
                            element: null,
                            visible: !0,
                            transform: {
                                translate: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                        }),
                        e(!0);
                    });
                });
            }
            _addOriginalItems() {
                return new Promise((t) => {
                    const e = [];
                    for (let t = 0; t < this.original.length; t++)
                        e.push(this._add(this.original[t])),
                        (this.original[t].dataset.itemId = t.toString());
                    Promise.all(e)
                        .then(() => t(!0))
                        .catch(() => t(!0));
                });
            }
            _addCloneItems() {
                return new Promise((t) => {
                    const e = [];
                    for (let t = 0; t < this.clones.length; t++)
                        e.push(this._add(this.clones[t]));
                    Promise.all(e)
                        .then(() => t(!0))
                        .catch(() => t(!0));
                });
            }
            _cloneElements() {
                const t = !this._isMatchMedia();
                return i.S.cloneElements(
                    this.original,
                    this.loopRounds,
                    t,
                    this.laneId
                );
            }
            _isMatchMedia() {
                return (
                    !this.pluginOptions.matchMedia ||
                    window.matchMedia(`${this.pluginOptions.matchMedia}`).matches
                );
            }
        }
        class m extends o {
            constructor({
                pluginOptions: t,
                geometry: e,
                scroller: i
            }) {
                super({
                        pluginOptions: t,
                        geometry: e,
                        scroller: i
                    }),
                    (this._horizontal = {
                        isStart: !1,
                        isMiddle: !1,
                        isEnd: !1
                    }),
                    (this._vertical = {
                        isStart: !1,
                        isMiddle: !1,
                        isEnd: !1
                    }),
                    (this._active = !1);
            }
            get active() {
                return this._active;
            }
            set active(t) {
                this._active = t;
            }
            get horizontal() {
                return this._horizontal;
            }
            set horizontal(t) {
                this._horizontal = t;
            }
            get vertical() {
                return this._vertical;
            }
            set vertical(t) {
                this._vertical = t;
            }
            update(t) {
                this._transformScrollVirtual(),
                    t && (this._updateHorizontal(t), this._updateVertical(t)),
                    this._updateActive();
            }
            _transformScrollVirtual() {
                this.pluginOptions.mapWheelEventYtoX ?
                    this.scroller.virtual.x < 0 &&
                    this.scroller.virtual.x < this.geometry.scrollableArea.width &&
                    (this.scroller.virtual.x =
                        this.geometry.scrollableArea.width +
                        Math.abs(
                            this.geometry.scrollableArea.width + this.scroller.virtual.x
                        )) :
                    (this.scroller.virtual.x < 0 &&
                        this.scroller.virtual.x < this.geometry.scrollableArea.width &&
                        (this.scroller.virtual.x =
                            this.geometry.scrollableArea.width +
                            Math.abs(
                                this.geometry.scrollableArea.width + this.scroller.virtual.x
                            )),
                        this.scroller.virtual.y < 0 &&
                        this.scroller.virtual.y < this.geometry.scrollableArea.height &&
                        (this.scroller.virtual.y =
                            this.geometry.scrollableArea.height +
                            Math.abs(
                                this.geometry.scrollableArea.height + this.scroller.virtual.y
                            )));
            }
            _updateHorizontal(t) {
                const {
                    left: e,
                    width: i
                } = t.rect;
                this.horizontal = {
                    isStart: this.scroller.virtual.x < e + i,
                    isMiddle: this.scroller.virtual.x > this.geometry.difference.horizontal &&
                        this.scroller.virtual.x <
                        this.geometry.scrollableArea.width + e + i,
                    isEnd: this.scroller.virtual.x >
                        this.geometry.scrollableArea.width +
                        this.geometry.difference.horizontal,
                };
            }
            _updateVertical(t) {
                const {
                    top: e,
                    height: i
                } = t.rect;
                this.vertical = {
                    isStart: this.scroller.virtual.y < e + i,
                    isMiddle: this.scroller.virtual.y > this.geometry.difference.vertical &&
                        this.scroller.virtual.y <
                        this.geometry.scrollableArea.height + e + i,
                    isEnd: this.scroller.virtual.y >
                        this.geometry.scrollableArea.height +
                        this.geometry.difference.vertical,
                };
            }
            _updateActive() {
                "horizontal" === this.pluginOptions.direction ?
                    (this.active =
                        this.horizontal.isStart ||
                        this.horizontal.isMiddle ||
                        this.horizontal.isEnd) :
                    (this.active =
                        this.vertical.isStart ||
                        this.vertical.isMiddle ||
                        this.vertical.isEnd);
            }
        }
        class g extends o {
            constructor({
                pluginOptions: t,
                geometry: e,
                scroller: i,
                loop: s,
                items: n,
                view: r,
                laneId: o,
            }) {
                super({
                        pluginOptions: t,
                        geometry: e,
                        scroller: i,
                        loop: s,
                        items: n,
                        view: r,
                    }),
                    (this._transformHooks = []),
                    (this._opacityHooks = []),
                    (this.laneId = o);
            }
            get laneId() {
                return this._laneId;
            }
            set laneId(t) {
                this._laneId = t;
            }
            get transformHooks() {
                return this._transformHooks;
            }
            set transformHooks(t) {
                (this._transformHooks = t), this.update();
            }
            addTransformHook(t) {
                this.transformHooks.push(t);
            }
            removeTransformHooks() {
                this.transformHooks = [];
            }
            get opacityHooks() {
                return this._opacityHooks;
            }
            set opacityHooks(t) {
                (this._opacityHooks = t), this.update();
            }


            update() {
                for (let t = 0; t < this.items.all.length; t++) {
                    const e = this.items.all[t];
                    this.loop.update(e);
                    const i = this._getTranslationItem(e),
                        n = g._isActiveTranslationItem({
                            item: e,
                            direction: this.pluginOptions.direction,
                            mapWheelEventYtoX: this.pluginOptions.mapWheelEventYtoX,
                            translate: i,
                        });
                    if (this.loop.active && n) {
                        let n = null,
                            r = this._getProgressItem({
                                item: e,
                                translate: i
                            }),
                            o = this._getProgressItemRelative({
                                item: e,
                                translate: i
                            }),
                            l = {
                                translate: i
                            };
                        if (this.transformHooks.length)
                            for (const i of this.transformHooks) {
                                const n = i({
                                    indexLane: this.laneId,
                                    indexItem: t,
                                    item: e,
                                    progressItem: r,
                                    translateItem: l.translate,
                                    laneGeometry: this.geometry,
                                    laneDirection: this.scroller.direction,
                                    laneVelocity: Math.abs(this.scroller.velocity),
                                });
                                l = s(l, n);
                            }
                        if (this.opacityHooks.length)
                            for (const i of this.opacityHooks)
                                n = i({
                                    indexLane: this.laneId,
                                    indexItem: t,
                                    item: e,
                                    progressItem: r,
                                    opacityItem: n,
                                    laneGeometry: this.geometry,
                                    laneDirection: this.scroller.direction,
                                    laneVelocity: Math.abs(this.scroller.velocity),
                                });
                        this.view.updateItem(this.laneId, t, {
                            element: e.element,
                            visible: !0,
                            transform: l,
                            opacity: n,
                            progress: r,
                            progressRelative: o,
                        });
                    } else {
                        let i;
                        if (this.opacityHooks.length)
                            for (const s of this.opacityHooks)
                                i = s({
                                    indexLane: this.laneId,
                                    indexItem: t,
                                    item: e,
                                    progressItem: 1,
                                    opacityItem: i,
                                    laneGeometry: this.geometry,
                                    laneDirection: this.scroller.direction,
                                    laneVelocity: Math.abs(this.scroller.velocity),
                                });
                        this.view.last[this.laneId].items[t].visible &&
                            this.view.updateItem(this.laneId, t, {
                                element: e.element,
                                visible: !1,
                                opacity: i,
                            });
                    }
                }
            }
            _getTranslationItem(t) {
                const {
                    top: e,
                    left: i
                } = t.rect,
                    s = -this.scroller.virtual.x,
                    n = -this.scroller.virtual.y;
                return this.pluginOptions.mapWheelEventYtoX ?
                    this._transformPositionForMappedWheelEvent({
                        left: i,
                        x: s,
                        y: n,
                        z: 0,
                    }) :
                    "horizontal" === this.pluginOptions.direction ?
                    this._transformPositionForHorizontalLoop({
                        left: i,
                        x: s,
                        y: n,
                        z: 0,
                    }) :
                    "vertical" === this.pluginOptions.direction ?
                    this._transformPositionForVerticalLoop({
                        top: e,
                        x: s,
                        y: n,
                        z: 0
                    }) :
                    void 0;
            }
            _getProgressItem({
                item: t,
                translate: e
            }) {
                return "horizontal" === this.pluginOptions.direction ?
                    this._getProgressItemHorizontal({
                        item: t,
                        translate: e
                    }) :
                    "vertical" === this.pluginOptions.direction ?
                    this._getProgressItemVertical({
                        item: t,
                        translate: e
                    }) :
                    void 0;
            }
            _getProgressItemRelative({
                item: t,
                translate: e
            }) {
                return "horizontal" === this.pluginOptions.direction ?
                    this._getProgressItemRelativeHorizontal({
                        item: t,
                        translate: e
                    }) :
                    "vertical" === this.pluginOptions.direction ?
                    this._getProgressItemRelativeVertical({
                        item: t,
                        translate: e
                    }) :
                    void 0;
            }
            _getProgressItemHorizontal({
                item: t,
                translate: e
            }) {
                const i = this.geometry.visibleArea.width / 2,
                    s = t.rect.width / 2;
                return (t.rect.left + s + e.x - i) / (i + s);
            }
            _getProgressItemRelativeHorizontal({
                item: t,
                translate: e
            }) {
                return (t.rect.left + e.x) / this.geometry.visibleArea.width;
            }

            _transformPositionForMappedWheelEvent({
                left: t,
                x: e,
                y: i,
                z: s
            }) {
                return (
                    this.loop.horizontal.isMiddle &&
                    t < this.scroller.virtual.x - this.geometry.difference.horizontal &&
                    (e = this.geometry.scrollableArea.width - this.scroller.virtual.x),
                    this.loop.horizontal.isEnd &&
                    t + this.geometry.scrollableArea.width <
                    this.scroller.virtual.x - this.geometry.difference.horizontal &&
                    (e =
                        this.geometry.scrollableArea.width +
                        (this.geometry.scrollableArea.width - this.scroller.virtual.x)), {
                        x: e,
                        y: 0,
                        z: s
                    }
                );
            }


            static _isActiveTranslationItem({
                item: t,
                direction: e,
                mapWheelEventYtoX: i,
                translate: s,
            }) {
                const {
                    x: n,
                    y: r
                } = s;
                return "horizontal" === e || i ?
                    n >= t.limit.translate.min.x && n <= t.limit.translate.max.x :
                    r >= t.limit.translate.min.y && r <= t.limit.translate.max.y;
            }
        }
        class f extends o {
            constructor() {
                super(...arguments), (this._value = 0);
            }
            get value() {
                return this._value;
            }
            set value(t) {
                this._value = parseFloat(t.toFixed(3));
            }
            update() {
                this.value = this._transformNormal({
                    x: this.scroller.virtual.x,
                    y: this.scroller.virtual.y,
                });
            }
            _transformNormal({
                x: t = 0,
                y: e = 0
            }) {
                let i,
                    s,
                    n = t,
                    r = e;
                return (
                    this.pluginOptions.loop ?
                    ((i = this.geometry.scrollableArea.width),
                        (s = this.geometry.scrollableArea.height)) :
                    ((i = this.geometry.difference.horizontal),
                        (s = this.geometry.difference.vertical)),
                    n > 0 && (n = t / i),
                    r > 0 && (r = e / s),
                    "horizontal" === this.pluginOptions.direction ? n : r
                );
            }
        }
        class v {
            constructor({
                id: t,
                container: e,
                options: i,
                view: s,
                controller: n
            }) {
                (this._visible = !1),
                (this.controller = n),
                (this.container = e),
                (this.pluginOptions = i),
                (this.view = s),
                (this.id = t),
                (this.view.current[this.id] = this.view.last[this.id] = {
                    visible: this.visible,
                    items: {}
                });
            }
            set prevIndex(t) {
                this._prevIndex = t;
            }
            get prevIndex() {
                return this._prevIndex;
            }
            _updatePrevIndex() {
                this.prevIndex = c(0, this.items.all.length, this.currentIndex - 1);
            }
            set currentIndex(t) {
                (this._currentIndex = t),
                this._updatePrevIndex(),
                    this._updateNextIndex();
            }
            get currentIndex() {
                return this._currentIndex;
            }
            set nextIndex(t) {
                this._nextIndex = t;
            }
            get nextIndex() {
                return this._nextIndex;
            }
            _updateNextIndex() {
                this.nextIndex = c(0, this.items.all.length, this.currentIndex + 1);
            }
            set loopPrevIndex(t) {
                this._loopPrevIndex = t;
            }
            get loopPrevIndex() {
                return this._loopPrevIndex;
            }
            _updateLoopPrevIndex() {
                this.loopPrevIndex = c(
                    0,
                    this.items.original.length,
                    this.loopCurrentIndex - 1
                );
            }
            set loopCurrentIndex(t) {
                (this._loopCurrentIndex = t),
                this._updateLoopPrevIndex(),
                    this._updateLoopNextIndex();
            }
            get loopCurrentIndex() {
                return this._loopCurrentIndex;
            }
            set loopNextIndex(t) {
                this._loopNextIndex = t;
            }
            get loopNextIndex() {
                return this._loopNextIndex;
            }
            _updateLoopNextIndex() {
                this.loopNextIndex = c(
                    0,
                    this.items.original.length,
                    this.loopCurrentIndex + 1
                );
            }
            set enabled(t) {
                this._enabled = t;
            }
            get enabled() {
                return this._enabled;
            }
            setup() {
                return new Promise((t) => {
                    this._updateScrollOptions().then(() => {
                        (this.geometry = new l({
                            container: this.container
                        })),
                        this.geometry.init().then(() => {
                            (this.scroller = new u({
                                pluginOptions: this.pluginOptions,
                                scrollOptions: this.scrollOptions,
                                geometry: this.geometry,
                            })),
                            (this.items = new p({
                                laneId: this.id,
                                container: this.container,
                                pluginOptions: this.pluginOptions,
                                geometry: this.geometry,
                                view: this.view,
                                controller: this.controller,
                            })),
                            this.items.init().then(() => {
                                (this.loop = new m({
                                    pluginOptions: this.pluginOptions,
                                    scroller: this.scroller,
                                    geometry: this.geometry,
                                })),
                                (this.position = new g({
                                    laneId: this.id,
                                    view: this.view,
                                    pluginOptions: this.pluginOptions,
                                    scroller: this.scroller,
                                    geometry: this.geometry,
                                    loop: this.loop,
                                    items: this.items,
                                })),
                                (this.progress = new f({
                                    pluginOptions: this.pluginOptions,
                                    geometry: this.geometry,
                                    items: this.items,
                                    scroller: this.scroller,
                                    position: this.position,
                                })),
                                t(!0);
                            });
                        });
                    });
                });
            }
            init() {
                return new Promise((t) => {
                    (this.enabled = !0), t(!0);
                });
            }
            update() {
                return new Promise((t) => {
                    if (!this.enabled) return void t(!0);
                    const e = this.geometry.scrollableArea,
                        i = this.progress.value;
                    this.geometry
                        .update()
                        .then(() => this.items.update())
                        .then(() => this.geometry.update())
                        .then(() => {
                            (this.scroller.virtual.x +=
                                e.width - this.geometry.scrollableArea.width),
                            (this.scroller.virtual.y +=
                                e.height - this.geometry.scrollableArea.height),
                            this.scroller.transform({
                                    x: this.scroller.last.x,
                                    y: this.scroller.last.y,
                                    deltaX: 0,
                                    deltaY: 0,
                                    isDragging: !1,
                                }),
                                this.scroller.update(),
                                this.progress.update(),
                                this.position.update(),
                                (this.progress.value = i),
                                t(!0);
                        });
                });
            }
            destroy() {
                this.items.destroy(), (this.enabled = !1);
            }
            enable() {
                this.enabled ||
                    (this.items.enable(), (this.visible = !0), (this.enabled = !0));
            }
            disable() {
                this.enabled &&
                    (this.items.disable(), (this.visible = !1), (this.enabled = !1));
            }
            set id(t) {
                this._id = i.S.setLaneId(this.container, t);
            }
            get id() {
                return this._id;
            }
            set scrollOptions(t) {
                this._scrollOptions = t;
            }
            get scrollOptions() {
                return this._scrollOptions;
            }
            _updateScrollOptions() {
                return new Promise((t) => {
                    let i = {};
                    if (this.pluginOptions.multiLane) {
                        let t = new e.E({
                            container: this.container,
                            attributeSelector: this.pluginOptions.multiLane.laneOptionsAttribute,
                        }).data;
                        this.pluginOptions.scroll && t && 0 !== Object.keys(t).length ?
                            ((i = s(this.pluginOptions.scroll, t)),
                                (i = e.E.transformScrollOptions(i))) :
                            (i =
                                this.pluginOptions.scroll &&
                                "options" in this.pluginOptions.multiLane &&
                                this.id in this.pluginOptions.multiLane.options ?
                                s(
                                    this.pluginOptions.scroll,
                                    this.pluginOptions.multiLane.options[this.id]
                                ) :
                                this.pluginOptions.scroll);
                    } else i = this.pluginOptions.scroll;
                    (this.scrollOptions = i), t(!0);
                });
            }
            updateItemsPosition() {
                this.enabled && this.position.update();
            }
            updateScrollPosition() {
                this.enabled && (this.scroller.update(), this.progress.update());
            }
            set visible(t) {
                this._visible = t;
            }
            get visible() {
                return this._visible;
            }
            set view(t) {
                this._view = t;
            }
            get view() {
                return this._view;
            }
        }
        class _ {
            constructor({
                elements: t,
                callback: e,
                options: i = {}
            }) {
                (this._handlers = {
                    update: this._onUpdate.bind(this)
                }),
                (this.elements = t),
                (this.callbacks = e),
                (this.options = i),
                this.elements.length &&
                    this._hasAnyIntersectCallbacks() &&
                    this.init();
            }
            set instance(t) {
                this._instance = t;
            }
            get instance() {
                return this._instance;
            }
            set callbacks(t) {
                "function" == typeof t &&
                    ((this._onIntersectCallback = t), (this._offIntersectCallback = t)),
                    "object" == typeof t &&
                    ((this._onIntersectCallback = t.onIntersect),
                        (this._offIntersectCallback = t.offIntersect));
            }
            get callbacks() {
                return this._callbacks;
            }
            set elements(t) {
                this._elements = t;
            }
            get elements() {
                return this._elements;
            }
            set options(t) {
                this._options = t;
            }
            get options() {
                return this._options;
            }
            init() {
                (this.instance = new IntersectionObserver(
                    this._handlers.update,
                    this.options
                )),
                this._observeElements();
            }
            destroy() {
                this.instance &&
                    this.instance &&
                    (this.instance.disconnect(), (this.instance = null));
            }
            _observeElements() {
                if (this.instance)
                    for (let t = 0; t < this.elements.length; t++)
                        this.instance.observe(this.elements[t]);
            }
            _onUpdate(t) {
                for (const e of t)
                    e.isIntersecting ?
                    this._onIntersectCallback({
                        target: e.target,
                        isIntersecting: e.isIntersecting,
                        entry: e,
                    }) :
                    this._offIntersectCallback({
                        target: e.target,
                        isIntersecting: e.isIntersecting,
                        entry: e,
                    });
            }
            _hasAnyIntersectCallbacks() {
                return (
                    "function" == typeof this._onIntersectCallback ||
                    "function" == typeof this._offIntersectCallback
                );
            }
        }
        class y {
            constructor({
                elements: t,
                callback: e
            }) {
                (this._handlers = {
                    update: this._onUpdate.bind(this)
                }),
                (this.elements = t),
                (this.callback = e),
                this.elements.length && this._hasCallback() && this.init();
            }
            set instance(t) {
                this._instance = t;
            }
            get instance() {
                return this._instance;
            }
            set callback(t) {
                this._callback = t;
            }
            get callback() {
                return this._callback;
            }
            set elements(t) {
                this._elements = t;
            }
            get elements() {
                return this._elements;
            }
            init() {
                (this.instance = new ResizeObserver(this._handlers.update)),
                this._observeElements();
            }
            destroy() {
                this.instance && (this.instance.disconnect(), (this.instance = null));
            }
            _onUpdate(t) {
                const e = [];
                for (const i of t) e.push(i.target);
                this.callback(e);
            }
            _observeElements() {
                if (this.instance)
                    for (let t = 0; t < this.elements.length; t++)
                        this.instance.observe(this.elements[t]);
            }
            _hasCallback() {
                return "function" == typeof this.callback;
            }
        }
        var b = n(199),
            x = n(110),
            w = n.n(x);
        class I extends b.v {
            constructor({
                autoLoad: t = !1,
                container: e,
                options: i,
                view: s
            }) {
                super({
                        autoLoad: t,
                        container: e,
                        options: i,
                        view: s
                    }),
                    (this._elements = []),
                    (this._lanes = []),
                    (this._visible = !0),
                    (this._snapping = !1),
                    (this._rafTimeout = 0),
                    (this._resized = !1),
                    (this._resizing = !1),
                    (this._handlers = {
                        animationFrame: this._onAnimationFrame.bind(this),
                        intersectionUpdate: this._onIntersectionUpdate.bind(this),
                        resize: this._onResize.bind(this),
                        focus: this._onFocus.bind(this),
                    }),
                    (this.ready = new Promise((t) => {
                        this.setReady = t;
                    })),
                    this.init();
            }
            init() {
                return new Promise((t) => {
                    this._updateElements()
                        .then(() => this._updateLanes())
                        .then(() => {
                            this._updateIntersection(),
                                this._updateResize(),
                                (this.enabled = !0),
                                this.setReady(),
                                t(!0);
                        });
                });
            }


            scroll(t) {
                this.visible &&
                    (this.raf ?
                        this._updateRafTimer() :
                        (this.emit("scrollStart"),
                            (this.raf = gsap.ticker.add(this._handlers.animationFrame))),
                        t && this.update(t));
            }
            snapItemToClosestPosition({
                indexItemTarget: t,
                indexLane: e = 0,
                position: s = "center",
                animate: n = !0,
                cb: r,
            } = {}) {
                if (!this.snapping)
                    if (
                        (this.snapTimer && (this.snapTimer.kill(), (this.snapTimer = null)),
                            (this.snapping = !0),
                            (this.snapTimer = gsap.delayedCall(0.4, () => {
                                this.snapping = !1;
                            })),
                            e && e in this.lanes)
                    ) {
                        const o =
                            "number" == typeof t ?
                            t :
                            this.lanes[e].view.getItemIndexClosestTo(e, s),
                            l = this.lanes[e].items.all[o].element,
                            a = i.S.getIndexItemLooped(l);
                        (this.lanes[e].currentIndex = o),
                        (this.lanes[e].loopCurrentIndex = a),
                        this._scrollTo({
                                indexItem: o,
                                indexLane: e,
                                position: s,
                                withSpeed: !0,
                                withEasing: n,
                                zeroVelocity: !0,
                            }),
                            this.emit("scrollSnap", {
                                indexItem: o,
                                indexItemLoop: a,
                                indexLane: e,
                                element: l,
                            }),
                            "function" == typeof r && r(e, o, a);
                    } else
                        for (let o = 0; o < this.lanes.length; o++) {
                            const l =
                                "number" == typeof t ?
                                t :
                                this.lanes[o].view.getItemIndexClosestTo(o, s),
                                a = this.lanes[o].items.all[l].element,
                                h = i.S.getIndexItemLooped(a);
                            (this.lanes[o].currentIndex = l),
                            (this.lanes[o].loopCurrentIndex = h),
                            this._scrollTo({
                                    indexItem: l,
                                    indexLane: o,
                                    position: s,
                                    withSpeed: !0,
                                    withEasing: n,
                                    zeroVelocity: !0,
                                }),
                                this.emit("scrollSnap", {
                                    indexItem: l,
                                    indexItemLoop: h,
                                    indexLane: e,
                                    element: a,
                                }),
                                "function" == typeof r && r(o, l, h);
                        }
            }

            update(t) {
                for (let e = 0; e < this.lanes.length; e++)
                    this._updateLane({
                        indexLane: e,
                        vsEvent: t
                    });
            }
            updateAllLanes() {
                return new Promise((t) => {
                    const e = [];
                    this._reset().then(() => {
                            for (let t = 0; t < this.lanes.length; t++)
                                e.push(this.lanes[t].update());
                        }),
                        Promise.all(e).then(() => t(!0));
                });
            }
            setProgress(t) {
                const e = {
                    progress: 0,
                    indexItem: void 0,
                    indexLane: void 0,
                    position: 0,
                    animate: !1,
                };
                if (
                    ("number" == typeof t && (e.progress = t),
                        "object" == typeof t &&
                        ("progress" in t &&
                            "number" == typeof t.progress &&
                            (e.progress = t.progress),
                            "indexLane" in t &&
                            "number" == typeof t.indexLane &&
                            (e.indexLane = t.indexLane),
                            "animate" in t &&
                            "boolean" == typeof t.animate &&
                            (e.animate = t.animate)),
                        "number" == typeof e.indexLane)
                ) {
                    const t = this._getProgressPosition({
                        progress: e.progress,
                        indexLane: e.indexLane,
                    });
                    this._scrollTo({
                        indexItem: e.indexItem,
                        indexLane: e.indexLane,
                        position: t,
                        withSpeed: !1,
                        withEasing: e.animate,
                    });
                } else
                    for (let t = 0; t < this.lanes.length; t++) {
                        const i = this._getProgressPosition({
                            progress: e.progress,
                            indexLane: t,
                        });
                        this._scrollTo({
                            indexItem: null,
                            indexLane: t,
                            position: i,
                            withSpeed: !1,
                            withEasing: e.animate,
                        });
                    }
            }
            getProgress(t) {
                if (t && t in this.lanes) return this.lanes[t].progress.value; {
                    const t = [];
                    for (let e = 0; e < this.lanes.length; e++)
                        t[e] = this.lanes[e].progress.value;
                    return t;
                }
            }
            scrollTo({
                indexItem: t,
                indexLane: e,
                position: i = "start",
                animate: s = !0,
            }) {
                if ("number" == typeof e)
                    this._scrollTo({
                        indexItem: t,
                        indexLane: e,
                        position: i,
                        withSpeed: !1,
                        withEasing: s,
                        zeroVelocity: !0,
                    });
                else
                    for (let e = 0; e < this.lanes.length; e++)
                        this._scrollTo({
                            indexItem: t,
                            indexLane: e,
                            position: i,
                            withSpeed: !1,
                            withEasing: s,
                            zeroVelocity: !0,
                        });
            }
            addTransformHook(t, e) {
                if ("function" == typeof t)
                    if (e && e in this.lanes) this.lanes[e].position.addTransformHook(t);
                    else
                        for (let e = 0; e < this.lanes.length; e++)
                            this.lanes[e].position.addTransformHook(t);
            }
            removeTransformHooks(t) {
                if (t && t in this.lanes) this.lanes[t].position.removeTransformHooks();
                else
                    for (let t = 0; t < this.lanes.length; t++)
                        this.lanes[t].position.removeTransformHooks();
            }
            addOpacityHook(t, e) {
                if ("function" == typeof t)
                    if (e && e in this.lanes) this.lanes[e].position.addOpacityHook(t);
                    else
                        for (let e = 0; e < this.lanes.length; e++)
                            this.lanes[e].position.addOpacityHook(t);
            }
            removeOpacityHooks(t) {
                if (t && t in this.lanes) this.lanes[t].position.removeOpacityHooks();
                else
                    for (let t = 0; t < this.lanes.length; t++)
                        this.lanes[t].position.removeOpacityHooks();
            }

            _updateLane({
                indexLane: t,
                vsEvent: e
            }) {
                t in this.lanes &&
                    (this.lanes[t].scroller.transform(e),
                        this.lanes[t].progress.update(),
                        (this.rafTimeout = this.lanes[t].scroller.timeout));
            }
            _scrollTo({
                indexItem: t,
                indexLane: i,
                position: s,
                withSpeed: n,
                withEasing: r,
                zeroVelocity: o,
            }) {
                this.lanes[i].scroller.reset();
                let l = e.E.getScrollOption({
                        option: "maxDelta",
                        scrollOptions: void 0 !== typeof i ?
                            this.lanes[i].scrollOptions : this.options.scroll,
                    }),
                    a = this._getItemScrollOffset({
                        indexItem: t,
                        indexLane: i,
                        position: s,
                    });
                const h = Math.abs(a);
                if (h > l && l > 0) {
                    const t = h / l;
                    a < 0 && (l = -l);
                    for (let e = 0; e < t; e++)
                        (a = t - e < 1 ? l * (t - e) : l),
                        this._updateLane({
                            indexLane: i,
                            vsEvent: {
                                x: 0,
                                y: 0,
                                deltaX: a,
                                deltaY: a,
                                isDragging: !1,
                                withSpeed: n,
                                withEasing: r,
                                zeroVelocity: o,
                                force: !0,
                            },
                        }),
                        this.scroll();
                } else
                    this._updateLane({
                        indexLane: i,
                        vsEvent: {
                            x: 0,
                            y: 0,
                            deltaX: a,
                            deltaY: a,
                            isDragging: !1,
                            withSpeed: n,
                            withEasing: r,
                            zeroVelocity: o,
                            force: !0,
                        },
                    }),
                    this.scroll();
            }
            _reset() {
                return new Promise((t) => {
                    this.raf &&
                        (gsap.ticker.remove(this._handlers.animationFrame),
                            (this.raf = null)),
                        this.rafTimer && (this.rafTimer.kill(), (this.rafTimer = null)),
                        this.rafTimeout && (this.rafTimeout = null),
                        t(!0);
                });
            }
            get raf() {
                return this._raf;
            }
            set raf(t) {
                this._raf = t;
            }
            _onAnimationFrame() {
                let t = 0,
                    e = "idle";
                for (let i = 0; i < this.lanes.length; i++) {
                    this.lanes[i].updateScrollPosition(),
                        this.lanes[i].updateItemsPosition();
                    const s = Math.abs(this.lanes[i].scroller.velocity);
                    s > t && (t = s), (e = this.lanes[i].scroller.direction);
                }
                this.emit("scrollUpdate", t, e);
            }
            get rafTimer() {
                return this._rafTimer;
            }
            set rafTimer(t) {
                this._rafTimer = t;
            }
            _updateRafTimer() {
                this.rafTimeout > 0 &&
                    (this.rafTimer && this.rafTimer.kill(),
                        (this.rafTimer = gsap.delayedCall(this.rafTimeout / 1e3, () => {
                            this.raf &&
                                (gsap.ticker.remove(this._handlers.animationFrame),
                                    (this.raf = null),
                                    this.emit("scrollComplete"));
                        })));
            }
            get rafTimeout() {
                return this._rafTimeout;
            }
            set rafTimeout(t) {
                this._rafTimeout < t && (this._rafTimeout = t);
            }
            set lanes(t) {
                this._lanes = t;
            }
            get lanes() {
                return this._lanes;
            }
            _updateLanes() {
                return new Promise((t) => {
                    const e = [],
                        i = [];
                    if (this.elements.length)
                        for (let t = 0; t < this.elements.length; t++) {
                            const s = new v({
                                id: t,
                                container: this.elements[t],
                                options: this.options,
                                view: this.view,
                                controller: this,
                            });
                            i.push(s),
                                e.push(
                                    s.setup().then(() => {
                                        s.init();
                                    })
                                );
                        }
                    Promise.all(e).then(() => {
                        (this.lanes = i), t(!0);
                    });
                });
            }
            set elements(t) {
                this._elements = t;
            }
            get elements() {
                return this._elements;
            }
            _updateElements() {
                return new Promise((t) => {
                    this.options.multiLane && this.options.multiLane.laneSelector ?
                        ((this.elements = i.S.getElementsInContainer(
                                this.container,
                                this.options.multiLane.laneSelector
                            )),
                            t(!0)) :
                        ((this.elements = [this.container]), t(!0));
                });
            }
            set intersection(t) {
                this._intersection = t;
            }
            get intersection() {
                return this._intersection;
            }
            _updateIntersection() {
                this.intersection = new _({
                    elements: this.elements,
                    callback: this._handlers.intersectionUpdate,
                });
            }
            _onIntersectionUpdate({
                target: t,
                isIntersecting: e
            }) {
                const s = i.S.getLaneId(t);
            }
            set resize(t) {
                this._resize = t;
            }
            get resize() {
                return this._resize;
            }
            set resized(t) {
                this._resized = t;
            }
            get resized() {
                return this._resized;
            }
            set resizing(t) {
                this._resizing = t;
            }
            get resizing() {
                return this._resizing;
            }
            _updateResize() {
                if (this.options.resizeObserver) {
                    let t,
                        e,
                        i = 0;
                    const s = this.elements;
                    "object" == typeof this.options.resizeObserver &&
                        ("number" == typeof this.options.resizeObserver.debounceTime &&
                            (i = this.options.resizeObserver.debounceTime),
                            this.options.resizeObserver.watchListElements),
                        i > 0 ?
                        ((t = w()(this._handlers.resize, i)),
                            (e = w()(this._handlers.focus, i))) :
                        ((t = this._handlers.resize), (e = this._handlers.focus)),
                        (this.resize = new y({
                            elements: s,
                            callback: t
                        }));
                }
                if (this.options.focusObserver) {
                    let t,
                        e = 0;
                    "object" == typeof this.options.focusObserver &&
                        "number" == typeof this.options.focusObserver.debounceTime &&
                        (e = this.options.focusObserver.debounceTime),
                        (t = e > 0 ? w()(this._handlers.focus, e) : this._handlers.focus),
                        window.addEventListener("focus", t, !1);
                }
            }
            _onResize(t) {
                if (!this.enabled) return;
                const e = [];
                if (this.resized && !this.resizing) {
                    (this.resizing = !0), this.emit("beforeResize"), this._reset();
                    for (const s of t) {
                        const t = i.S.getLaneId(s),
                            n = this.lanes[t].update();
                        e.push(n);
                    }
                    Promise.all(e).then(() => {
                        this.emit("afterResize"), (this.resizing = !1), (this.resized = !0);
                    });
                } else this.resized = !0;
            }
            _onFocus() {
                if (this.enabled) {
                    if (this.resized && !this.resizing) {
                        (this.resizing = !0), this.emit("beforeResize"), this._reset();
                        for (const t of this.elements) {
                            const e = i.S.getLaneId(t);
                            this.lanes[e].update();
                        }
                        this.emit("afterResize"), (this.resizing = !1);
                    }
                    this.resized = !0;
                }
            }
            get snapTimer() {
                return this._snapTimer;
            }
            set snapTimer(t) {
                this._snapTimer = t;
            }
            get snapping() {
                return this._snapping;
            }
            set snapping(t) {
                this._snapping = t;
            }
            set visible(t) {
                this._visible = t;
            }
            get visible() {
                return this._visible;
            }


            _getItemScrollOffset({
                indexLane: t,
                indexItem: i,
                position: s = "start",
            }) {
                "string" == typeof t && (t = parseInt(t)),
                    "string" == typeof i && (i = parseInt(i));
                const n = this.lanes[t],
                    r = "horizontal" === this.options.direction,
                    o = e.E.getScrollOption({
                        option: "inverse",
                        scrollOptions: n.scrollOptions,
                    }) ?
                    -1 :
                    1;
                let l = 0,
                    a = 0,
                    h = n.geometry.visibleArea.height,
                    c = n.geometry.scrollableArea.height,
                    u = n.scroller.virtual.y,
                    d = n.geometry.difference.vertical;
                if (
                    (r &&
                        ((h = n.geometry.visibleArea.width),
                            (c = n.geometry.scrollableArea.width),
                            (u = n.scroller.virtual.x),
                            (d = n.geometry.difference.horizontal)),
                        -1 === i && (i = n.items.all.length - 1),
                        i || "number" != typeof s || (l = u - s),
                        "number" == typeof i && i in n.items.all)
                ) {
                    let t = n.items.all[i].rect.top,
                        e = n.items.all[i].rect.height;
                    switch (
                        (r &&
                            ((t = n.items.all[i].rect.left), (e = n.items.all[i].rect.width)),
                            s)
                    ) {
                        case "start":
                            a = t;
                            break;
                        case "center":
                            a = t - (h - e) / 2;
                            break;
                        case "end":
                            a = t - (h - e);
                    }
                    l = u - a;
                }
                return (
                    this.options.loop &&
                    (n.loop[this.options.direction].isMiddle && (l -= c),
                        n.loop[this.options.direction].isEnd && (l -= c),
                        Math.abs(0.75 * l) > h && (l < 0 ? (l += c) : (l -= c))),
                    l * o
                );
            }
            _getProgressPosition({
                progress: t,
                indexLane: e
            }) {
                return t * this._getGeometryDifference(e);
            }
            _getGeometryDifference(t) {
                return "horizontal" === this.options.direction ?
                    this.lanes[t].geometry.difference.horizontal :
                    this.lanes[t].geometry.difference.vertical;
            }
            setReady() {}
        }
        class O extends b.v {
            constructor({
                autoLoad: t = !0,
                options: e
            }) {
                super({
                        autoLoad: t,
                        options: e
                    }),
                    (this._last = {}),
                    (this._current = {});
            }
            get current() {
                return this._current;
            }
            set current(t) {
                this._current = t;
            }
            get last() {
                return this._last;
            }
            set last(t) {
                this._last = t;
            }
            update(t) {
                Object.keys(t).forEach((e) => {
                    this.updateLane(e, t[e]);
                });
            }

            updateItem(t, e, i) {
                "element" in i &&
                    ((this.last[t].items[e].element = this.current[t].items[e].element),
                        (this.current[t].items[e].element = i.element)),
                    "opacity" in i &&
                    ((this.last[t].items[e].opacity = this.current[t].items[e].opacity),
                        (this.current[t].items[e].opacity = i.opacity)),
                    "visible" in i &&
                    ((this.last[t].items[e].visible = this.current[t].items[e].visible),
                        (this.current[t].items[e].visible = i.visible),
                        this._toggleVisibilityClassChange(i)),
                    "transform" in i &&
                    ((this.last[t].items[e].transform =
                            this.current[t].items[e].transform),
                        (this.current[t].items[e].transform = i.transform)),
                    "progress" in i &&
                    ((this.last[t].items[e].progress =
                            this.current[t].items[e].progress),
                        (this.current[t].items[e].progress = i.progress)),
                    "progressRelative" in i &&
                    ((this.last[t].items[e].progressRelative =
                            this.current[t].items[e].progressRelative),
                        (this.current[t].items[e].progressRelative = i.progressRelative)),
                    this._onUpdateItem(i, t, e);
            }

            _onUpdateItem(t, e, i) {
                this.emit("update", {
                    updatedItemState: t,
                    indexLane: e,
                    indexItem: i,
                });
            }
            _toggleVisibilityClassChange(t) {
                "string" == typeof this.options.toggleViewClass &&
                    this.options.toggleViewClass &&
                    (t.visible ?
                        t.element.classList.contains(this.options.toggleViewClass) ||
                        t.element.classList.add(this.options.toggleViewClass) :
                        t.element.classList.remove(this.options.toggleViewClass));
            }
        }
        class L extends t.TypedEmitter {
            constructor({
                container: t,
                options: e
            }) {
                super(),
                    (this._enabled = !1),
                    (this._pluginsInit = !1),
                    (this._initialized = !1),
                    (this._plugins = {}),
                    (this.ready = new Promise((t) => {
                        this.setReady = t;
                    })),
                    (this.pluginsReady = new Promise((t) => {
                        this.setPluginsReady = t;
                    })),
                    t &&
                    e &&
                    (this._updateContainer(t),
                        this._updateOptions(e),
                        this._updateView(),
                        this._updateController());
            }
            get enabled() {
                return this._enabled;
            }
            set enabled(t) {
                (this._enabled = t),
                "string" == typeof this.options.toggleEnabledClass &&
                    this.container.classList.toggle(
                        this.options.toggleEnabledClass,
                        this.enabled
                    );
            }
            get initialized() {
                return this._initialized;
            }
            set initialized(t) {
                this._initialized = t;
            }
            get pluginsInit() {
                return this._pluginsInit;
            }
            set pluginsInit(t) {
                (this._pluginsInit = t),
                "string" == typeof this.options.toggleReadyClass &&
                    this.container.classList.toggle(
                        this.options.toggleReadyClass,
                        this.pluginsInit
                    );
            }
            get controller() {
                return this._controller;
            }
            set controller(t) {
                this._controller = t;
            }
            _updateController() {
                this.controller = new I({
                    container: this.container,
                    options: this.options,
                    view: this.view,
                });
            }
            get view() {
                return this._view;
            }
            set view(t) {
                this._view = t;
            }
            _updateView() {
                this.view = new O({
                    options: this.options
                });
            }
            get plugins() {
                return this._plugins;
            }
            set plugins(t) {
                this._plugins = t;
            }
            get container() {
                return this._container;
            }
            set container(t) {
                this._container = t;
            }
            _updateContainer(t) {
                this.container = i.S.getElementByStringSelector(t);
            }
            get options() {
                return this._options;
            }
            set options(t) {
                this._options = t;
            }
            _updateOptions(t) {
                this.options = new e.E({
                    container: this.container,
                    attributeSelector: "data-arts-infinite-list-options",
                    options: t,
                }).data;
            }


        }

        const T = {
            renderer: () => n.e(324).then(n.bind(n, 170)),
            progressEffect: () => n.e(190).then(n.bind(n, 105)),
        };
        n(723), n(905);
        const z = class extends L {
            constructor(t, e) {
                super({
                        container: t,
                        options: e
                    }),
                    this.options.init &&
                    (this.options.matchMedia &&
                        !window.matchMedia(`${this.options.matchMedia}`).matches ?
                        (this.matchMedia = new E({
                            condition: this.options.matchMedia.toString(),
                            callbackMatch: this.init.bind(this),
                        })) :
                        this.init());
            }
            init() {
                this.initialized ||
                    (this.matchMedia && this.matchMedia.destroy(),
                        "string" == typeof this.options.matchMedia &&
                        (this.matchMedia = new E({
                            condition: this.options.matchMedia,
                            callbackMatch: this.enable.bind(this),
                            callbackNoMatch: this.disable.bind(this),
                        })),
                        (this.initialized = !0),
                        (this.enabled = !0),
                        this.emit("afterInit"),
                        this.options.plugins &&
                        this.controller.ready.then(() => {
                            this.initPlugins();
                        }));
            }


            update() {
                this.controller.updateAllLanes(),
                    "renderer" in this.plugins &&
                    "function" == typeof this.plugins.renderer.update &&
                    this.plugins.renderer.update();
            }
            registerPlugin(t, e, i = {}, s = !0) {
                t || (t = "plugin_" + new Date().getTime().toString()),
                    Object.assign(this.plugins, {
                        [t]: new e({
                            container: this.container,
                            options: this.options,
                            controller: this.controller,
                            view: this.view,
                            config: i,
                        }),
                    }),
                    s && Object.assign(this, {
                        [t]: this.plugins[t]
                    });
            }
            initPlugins() {
                if (!this.initialized) return;
                const t = [];
                for (const [e, i] of Object.entries(this.options.plugins))
                    if (i && T.hasOwnProperty(e)) {
                        const s = new Promise((t) => {
                            T[e]().then((s) => {
                                "default" in s && (this.registerPlugin(e, s.default, i), t(!0));
                            });
                        });
                        t.push(s);
                    }
                Promise.all(t)
                    .then(this.setReady.bind(this))
                    .then(this.setPluginsReady.bind(this));
            }

        };
    })(),
    (this.ArtsInfiniteList = r.default);
})();

class ArcImages extends BaseComponent {
    constructor({
            name: _0x1434b8,
            loadInnerComponents: _0x136276,
            loadAfterSyncStyles: _0x597db5,
            parent: _0x15976b,
            element: _0x54ff6c
        }) {
            super({
                'name': _0x1434b8,
                'loadInnerComponents': _0x136276,
                'loadAfterSyncStyles': _0x597db5,
                'parent': _0x15976b,
                'element': _0x54ff6c,
                'defaults': {
                    'loop': false,
                    'autoClone': false,
                    'minCloneLoopRounds': 0x1,
                    'maxCloneLoopRounds': 0x1,
                    'scrub': 0.001,
                    'progressEffect': {
                        'preset': "arc",
                        'intensity': 0.4
                    }
                },
                'innerElements': {
                    'lanes': ".arc-container",
                    'items': ".arc-box"
                }
            });
            this._handlers = {
                'progressScene': this._onProgressScene.bind(this)
            };
            this.dataReady["finally"](() => {
                this.setup();
            });
        }
        ["init"]() {
            return new Promise(_0x4d03ed => {
                this._createInfiniteList();
                if (this.infiniteList) {
                    this._animateOnScroll();
                    this.infiniteList.pluginsReady["finally"](() => {
                        this.infiniteList.update();
                        this._onProgressScene({
                            'progress': 0.0001
                        });
                        _0x4d03ed(true);
                    });
                } else {
                    _0x4d03ed(true);
                }
            });
        }
        ["destroy"]() {
            return new Promise(_0x41c24e => {
                const _0x3f4b06 = [];
                if (this.infiniteList) {
                    const _0x389ec9 = scheduler.postTask(() => {
                        this.infiniteList.destroy();
                    });
                    _0x3f4b06.push(_0x389ec9);
                }
                if (this.animationScroll && typeof this.animationScroll.kill === 'function') {
                    const _0x48c6f1 = scheduler.postTask(() => {
                        this.animationScroll.kill();
                    });
                    _0x3f4b06.push(_0x48c6f1);
                }
                if (this._progressRaf) {
                    cancelAnimationFrame(this._progressRaf);
                    this._progressRaf = 0;
                }
                Promise.all(_0x3f4b06)['finally'](() => _0x41c24e(true));
            });
        }
        ['_createInfiniteList']() {
            this.infiniteList = new ArtsInfiniteList(this.element, {
                'direction': "horizontal",
                'listElementsSelector': this.innerSelectors.items,
                'multiLane': {
                    'laneSelector': this.innerSelectors.lanes,
                    'laneOptionsAttribute': "data-arts-infinite-list-options"
                },
                'autoClone': !!this.options.loop && this.options.autoClone,
                'loop': this.options.loop,
                'minCloneLoopRounds': this.options.minCloneLoopRounds,
                'maxCloneLoopRounds': this.options.maxCloneLoopRounds,
                'plugins': {
                    'scroll': false,
                    'speedEffect': this.options.speedEffect,
                    'progressEffect': this.options.progressEffect
                }
            });
        }
        ["_animateOnScroll"]() {
            let rafId = 0;
            let lastSelf = null;

            const onUpdate = (self) => {
                lastSelf = self;

                if (rafId) return;

                rafId = requestAnimationFrame(() => {
                    rafId = 0;

                    if (!lastSelf) return;

                    this._handlers.progressScene(lastSelf);
                });
            };

            this.animationScroll = ScrollTrigger.create({
                trigger: this.element,
                start: () => "top bottom",
                end: () => "bottom+=20% top",
                onUpdate,
                scrub: false,
                invalidateOnRefresh: true,
            });
        }
        ['_onProgressScene']({
            progress
        } = {
            progress: 0
        }) {
            const clamp01 = (v) => Math.min(1, Math.max(0, v));

            const TAU = 0.14;
            const EPS = 0.0006;

            const target = clamp01(progress);

            this._lastProgress = target;

            this._targetProgress = target;

            if (typeof this._currentProgress !== "number") {
                this._currentProgress = target;
            }

            if (this._progressRaf) {
                return;
            }

            let lastTs = performance.now();

            const tick = (ts) => {
                if (!this.infiniteList || !this.infiniteList.controller) {
                    this._progressRaf = 0;
                    return;
                }

                const rawDt = (ts - lastTs) / 1000;
                const dt = Math.min(0.05, Math.max(0, rawDt));
                lastTs = ts;

                const alpha = 1 - Math.exp(-dt / TAU);

                const cur = this._currentProgress;
                const next = cur + (this._targetProgress - cur) * alpha;

                this._currentProgress = next;
                this.infiniteList.controller.setProgress(next);

                if (Math.abs(this._targetProgress - next) <= EPS) {
                    this._currentProgress = this._targetProgress;
                    this.infiniteList.controller.setProgress(this._currentProgress);
                    this._progressRaf = 0;
                    return;
                }

                this._progressRaf = requestAnimationFrame(tick);
            };

            this._progressRaf = requestAnimationFrame(tick);
        }
}
window.ArcImages = ArcImages;

(() => {
    const app = (window.app = window.app || {});

    app.elements = {
        container: document.querySelector(".main"),
        content: document.querySelector(".main-wrap"),
    };

    app.utilities = (typeof Utilities === "function") ? new Utilities() : null;
    app.componentsManager = (typeof ComponentsManager === "function") ? new ComponentsManager() : null;

    app.loadLazy = () => {
        if (typeof LazyLoad !== "function") return Promise.resolve(false);

        app.lazy = new LazyLoad({
            threshold: 800,
            cancel_on_exit: false,
            unobserve_entered: true,
        });

        return Promise.resolve(true);
    };

    app.initComponents = async () => {
        if (!app.componentsManager || !app.elements.container) return;

        const firstBatch = app.componentsManager.init({
            scope: app.elements.container,
            loadOnlyFirst: true,
        });

        if (Array.isArray(firstBatch) && firstBatch.length) {
            await Promise.all(firstBatch.filter(Boolean));
        }

        const fullBatch = app.componentsManager.init({
            scope: app.elements.container,
        });

        if (Array.isArray(fullBatch) && fullBatch.length) {
            await Promise.all(fullBatch.filter(Boolean));
        }
    };

    app.afterInit = () => {
        if (app.lazy && typeof app.lazy.update === "function") {
            app.lazy.update();
        }

        if (typeof app.setLoaded === "function") {
            app.setLoaded(true);
        }
    };

    app.init = async () => {
        if (!app.elements.container) return;

        await Promise.all([app.loadLazy()]);

        await app.initComponents();
        app.afterInit();
    };

    const run = () => {
        app.init();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run, {
            once: true
        });
    } else {
        run();
    }
})();
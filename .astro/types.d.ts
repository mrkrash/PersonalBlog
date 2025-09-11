declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"blog": {
"2-giugno.md": {
	id: "2-giugno.md";
  slug: "2-giugno";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"3-umts-e-la-scelta-dellofferta-giusta.md": {
	id: "3-umts-e-la-scelta-dellofferta-giusta.md";
  slug: "3-umts-e-la-scelta-dellofferta-giusta";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"active-directory-e-distribuzione-software.md": {
	id: "active-directory-e-distribuzione-software.md";
  slug: "active-directory-e-distribuzione-software";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"active-directory.md": {
	id: "active-directory.md";
  slug: "active-directory";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"addio-google-instant-search.md": {
	id: "addio-google-instant-search.md";
  slug: "addio-google-instant-search";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"aggiornare-opensuse-dalla-versione-11-4-alla-12-1-desktop-e-server.md": {
	id: "aggiornare-opensuse-dalla-versione-11-4-alla-12-1-desktop-e-server.md";
  slug: "aggiornare-opensuse-dalla-versione-11-4-alla-12-1-desktop-e-server";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"alfa-romeo-se-la-provi-non-cambi.md": {
	id: "alfa-romeo-se-la-provi-non-cambi.md";
  slug: "alfa-romeo-se-la-provi-non-cambi";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"alieni.md": {
	id: "alieni.md";
  slug: "alieni";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"alphabet.md": {
	id: "alphabet.md";
  slug: "alphabet";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"android-unlock-semiguida-allo-sblocco-del-sistema-da-linux.md": {
	id: "android-unlock-semiguida-allo-sblocco-del-sistema-da-linux.md";
  slug: "android-unlock-semiguida-allo-sblocco-del-sistema-da-linux";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"caricare-files-tramite-ajax.md": {
	id: "caricare-files-tramite-ajax.md";
  slug: "caricare-files-tramite-ajax";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"carlo.md": {
	id: "carlo.md";
  slug: "carlo";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"certificati-ssl-conversione-tra-formati.md": {
	id: "certificati-ssl-conversione-tra-formati.md";
  slug: "certificati-ssl-conversione-tra-formati";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"ci-vuole-una-pazienza.md": {
	id: "ci-vuole-una-pazienza.md";
  slug: "ci-vuole-una-pazienza";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"cifs.md": {
	id: "cifs.md";
  slug: "cifs";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"confini.md": {
	id: "confini.md";
  slug: "confini";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"cose-gravi.md": {
	id: "cose-gravi.md";
  slug: "cose-gravi";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"credibilita-oleosa.md": {
	id: "credibilita-oleosa.md";
  slug: "credibilita-oleosa";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"design-patterns-history.md": {
	id: "design-patterns-history.md";
  slug: "design-patterns-history";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"design-patterns.md": {
	id: "design-patterns.md";
  slug: "design-patterns";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"drupal-8-rimuovere-o-disabilitare-i-moduli-manualmente.md": {
	id: "drupal-8-rimuovere-o-disabilitare-i-moduli-manualmente.md";
  slug: "drupal-8-rimuovere-o-disabilitare-i-moduli-manualmente";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"encfs-gnome-e-richiesta-password.md": {
	id: "encfs-gnome-e-richiesta-password.md";
  slug: "encfs-gnome-e-richiesta-password";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"error-80070005-access-denied.md": {
	id: "error-80070005-access-denied.md";
  slug: "error-80070005-access-denied";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"exchange-2007-e-rinnovo-certificati-ssl.md": {
	id: "exchange-2007-e-rinnovo-certificati-ssl.md";
  slug: "exchange-2007-e-rinnovo-certificati-ssl";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"ffmpeg-sync.md": {
	id: "ffmpeg-sync.md";
  slug: "ffmpeg-sync";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"firma-automatica-per-ogni-post.md": {
	id: "firma-automatica-per-ogni-post.md";
  slug: "firma-automatica-per-ogni-post";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"formattare-le-date-in-vue.md": {
	id: "formattare-le-date-in-vue.md";
  slug: "formattare-le-date-in-vue";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"freebsd.md": {
	id: "freebsd.md";
  slug: "freebsd";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"git-rename-branch.md": {
	id: "git-rename-branch.md";
  slug: "git-rename-branch";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"google-music-manager-opensuse.md": {
	id: "google-music-manager-opensuse.md";
  slug: "google-music-manager-opensuse";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"hosts-allow.md": {
	id: "hosts-allow.md";
  slug: "hosts-allow";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"il-prezzo-del-lavoro-altrui.md": {
	id: "il-prezzo-del-lavoro-altrui.md";
  slug: "il-prezzo-del-lavoro-altrui";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"il-professionista.md": {
	id: "il-professionista.md";
  slug: "il-professionista";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"incrementare-il-limite-degli-allegati.md": {
	id: "incrementare-il-limite-degli-allegati.md";
  slug: "incrementare-il-limite-degli-allegati";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"istruire-spamassassin.md": {
	id: "istruire-spamassassin.md";
  slug: "istruire-spamassassin";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"limite-sessioni-telnet.md": {
	id: "limite-sessioni-telnet.md";
  slug: "limite-sessioni-telnet";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"mr-robot.md": {
	id: "mr-robot.md";
  slug: "mr-robot";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"mysql-cronjob.md": {
	id: "mysql-cronjob.md";
  slug: "mysql-cronjob";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"noicompriamoauto-ma-solo-se-sei-disperato.md": {
	id: "noicompriamoauto-ma-solo-se-sei-disperato.md";
  slug: "noicompriamoauto-ma-solo-se-sei-disperato";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"nullish-operator.md": {
	id: "nullish-operator.md";
  slug: "nullish-operator";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"office365-e-ingegneri-vari.md": {
	id: "office365-e-ingegneri-vari.md";
  slug: "office365-e-ingegneri-vari";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"ownsership.md": {
	id: "ownsership.md";
  slug: "ownsership";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"persone-perse.md": {
	id: "persone-perse.md";
  slug: "persone-perse";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"prisoner-709.md": {
	id: "prisoner-709.md";
  slug: "prisoner-709";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"proc-boiler.md": {
	id: "proc-boiler.md";
  slug: "proc-boiler";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"procmail-vdeliver.md": {
	id: "procmail-vdeliver.md";
  slug: "procmail-vdeliver";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"proftpd-e-condivisione-cifs-samba.md": {
	id: "proftpd-e-condivisione-cifs-samba.md";
  slug: "proftpd-e-condivisione-cifs-samba";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"pubblicare-unapp-realizzata-con-phonegap-su-android-playstore.md": {
	id: "pubblicare-unapp-realizzata-con-phonegap-su-android-playstore.md";
  slug: "pubblicare-unapp-realizzata-con-phonegap-su-android-playstore";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"qmail-systemd.md": {
	id: "qmail-systemd.md";
  slug: "qmail-systemd";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"raspberry-touchscreen-kumantech-35.md": {
	id: "raspberry-touchscreen-kumantech-35.md";
  slug: "raspberry-touchscreen-kumantech-35";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"refactoring.md": {
	id: "refactoring.md";
  slug: "refactoring";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"rekonq.md": {
	id: "rekonq.md";
  slug: "rekonq";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"sasc-ng.md": {
	id: "sasc-ng.md";
  slug: "sasc-ng";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"serposcope-docker-opensuse.md": {
	id: "serposcope-docker-opensuse.md";
  slug: "serposcope-docker-opensuse";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"sicilia-sole-mare-e-sperimentazione-politica.md": {
	id: "sicilia-sole-mare-e-sperimentazione-politica.md";
  slug: "sicilia-sole-mare-e-sperimentazione-politica";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"sincronizzazione-utenti-active-directory-zimbra.md": {
	id: "sincronizzazione-utenti-active-directory-zimbra.md";
  slug: "sincronizzazione-utenti-active-directory-zimbra";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"sistema-italia.md": {
	id: "sistema-italia.md";
  slug: "sistema-italia";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"sonata-gedmo-event.md": {
	id: "sonata-gedmo-event.md";
  slug: "sonata-gedmo-event";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"stanchezza.md": {
	id: "stanchezza.md";
  slug: "stanchezza";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"studiate-informatevi-non-usate-internet-per-leggere-qualche-blog-e-basta.md": {
	id: "studiate-informatevi-non-usate-internet-per-leggere-qualche-blog-e-basta.md";
  slug: "studiate-informatevi-non-usate-internet-per-leggere-qualche-blog-e-basta";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"systemd-php-cgi.md": {
	id: "systemd-php-cgi.md";
  slug: "systemd-php-cgi";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"transactions-e-acid.md": {
	id: "transactions-e-acid.md";
  slug: "transactions-e-acid";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"transmission-web-interface-nginx.md": {
	id: "transmission-web-interface-nginx.md";
  slug: "transmission-web-interface-nginx";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"tsm-scheduler-client-systemd.md": {
	id: "tsm-scheduler-client-systemd.md";
  slug: "tsm-scheduler-client-systemd";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"value-objects.md": {
	id: "value-objects.md";
  slug: "value-objects";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"vdr-init-script.md": {
	id: "vdr-init-script.md";
  slug: "vdr-init-script";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"winwinwin.md": {
	id: "winwinwin.md";
  slug: "winwinwin";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"xbmc-pvr-testing2-branch-xbmc-addons.md": {
	id: "xbmc-pvr-testing2-branch-xbmc-addons.md";
  slug: "xbmc-pvr-testing2-branch-xbmc-addons";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"xsession-su-ms-windows.md": {
	id: "xsession-su-ms-windows.md";
  slug: "xsession-su-ms-windows";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"zimbra-lentezza-virtualiron.md": {
	id: "zimbra-lentezza-virtualiron.md";
  slug: "zimbra-lentezza-virtualiron";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("../src/content/config.js");
}

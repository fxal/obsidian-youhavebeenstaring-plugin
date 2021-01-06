import { App, Modal, Notice, Plugin, PluginSettingTab, Setting} from 'obsidian';

interface YouHaveBeenStaringSettings {
    totalUptime: number;
    lastLoad: number;
    showTotalUptimeInStatusBar: boolean; // True, if additionally to the uptime of today the total uptime shall be displayed in the status bar
    showUptimeTodaySinceMidnight: boolean; // True, if the status bar shall display the uptime since 0:00 local time today if lastLoad is not today but on previous days, false if it shall use lastLoad as reference
    staringText: string;
    totalStaringText: string;
}

const SETTINGS: YouHaveBeenStaringSettings = {
    totalUptime: 0,
    lastLoad: Date.now(),
    showTotalUptimeInStatusBar: false,
    showUptimeTodaySinceMidnight: false,
    staringText: 'You have been staring at your vault for ',
    totalStaringText: 'Your total staring time in this vault is '
}

export default class YouHaveBeenStaring extends Plugin {
    settings: YouHaveBeenStaringSettings;
    staringTimeStatusBar: HTMLElement;
    totalStaringTimeStatusBar: HTMLElement;

    async onload() {
        await this.loadSettings();
        this.settings.lastLoad = Date.now();
        await this.saveSettings();

        this.staringTimeStatusBar = this.addStatusBarItem();

        this.totalStaringTimeStatusBar = this.addStatusBarItem();

        this.registerInterval(window.setInterval(() => 
            {
                this.showTimeSinceLoad(),
                this.showTotalStaringTime(),
                this.settings.totalUptime +=1000,
                this.saveSettings()
            }, 
                1000
        ));

        this.addSettingTab(new YouHaveBeenStaringSettingsTab(this.app, this));
    }

    showTimeSinceLoad(): void {
        if(this.settings.lastLoad) {
            let moment = (window as any).moment;

            let from = this.settings.showUptimeTodaySinceMidnight && !moment(this.settings.lastLoad).isSame(moment(Date.now()), 'd') 
                ? moment(Date.now()).startOf('day').fromNow(true) 
                : moment(this.settings.lastLoad).fromNow(true);

            this.staringTimeStatusBar.setText(this.settings.staringText + `${from}`);
        }
    }

    showTotalStaringTime(): void {
        if(this.settings.showTotalUptimeInStatusBar && this.settings.totalUptime > 0) {
            let moment = (window as any).moment;
            let totalStaringTime = moment.duration(this.settings.totalUptime, "milliseconds").humanize();
            this.totalStaringTimeStatusBar.setText(this.settings.totalStaringText + `${totalStaringTime}`);
        }
    }
    
    async loadSettings() {
        this.settings = Object.assign(SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class YouHaveBeenStaringSettingsTab extends PluginSettingTab {
    plugin: YouHaveBeenStaring;

    constructor(app: App, plugin: YouHaveBeenStaring) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        let {containerEl} = this;
        containerEl.empty();
        containerEl.createEl('h3', {text: 'YouHaveBeenStaring settings'});

        new Setting(containerEl)
            .setName('Show total staring duration')
            .setDesc('Displays the total duration you have been staring on your vault (well at least when this plugin was able to measure it).')
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.showTotalUptimeInStatusBar)
                    .onChange((value) => {
                        this.plugin.settings.showTotalUptimeInStatusBar = value;
                        this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Show staring uptime since midnight')
            .setDesc('The staring duration of today is calculated since midnight of today if the initial load timestamp of this session was on a previous day.')
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.showUptimeTodaySinceMidnight)
                    .onChange((value) => {
                        this.plugin.settings.showUptimeTodaySinceMidnight = value;
                        this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Status bar text of staring time')
            .setDesc('Overrides the status bar text displaying your staring time.')
            .addText((text) =>
                    text
                        .setValue(this.plugin.settings.staringText)
                        .setPlaceholder('You have been staring at your vault for ')
                        .onChange((value) => {
                            this.plugin.settings.staringText = value;
                            this.plugin.saveSettings();
                        })
            );

        new Setting(containerEl)
            .setName('Status bar text of total staring time')
            .setDesc('Overrides the status bar text displaying your total staring time for this vault.')
            .addText((text) =>
                    text
                        .setValue(this.plugin.settings.totalStaringText)
                        .setPlaceholder('Your total staring time in this vault is ')
                        .onChange((value) => {
                            this.plugin.settings.totalStaringText = value;
                            this.plugin.saveSettings();
                        })
            );
    }
}


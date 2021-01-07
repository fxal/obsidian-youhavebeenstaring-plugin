import { addIcon, App, Modal, Notice, Plugin, PluginSettingTab, Setting} from 'obsidian';

interface YouHaveBeenStaringSettings {
    totalUptime: number; // Total uptime / sum of all sessions in millis
    lastLoad: number; // Timestamp when the last load of the plugin occurred
    currentSessionDuration: number; // Duration of this session in millis
    showTotalUptimeInStatusBar: boolean; // True, if additionally to the uptime of today the total uptime shall be displayed in the status bar
    staringText: string;
    totalStaringText: string;
    pausedText: string;
}

const SETTINGS: YouHaveBeenStaringSettings = {
    totalUptime: 0,
    lastLoad: Date.now(),
    currentSessionDuration: 0,
    showTotalUptimeInStatusBar: false,
    staringText: 'You have been staring at your vault for ',
    totalStaringText: 'Your total staring time in this vault is ',
    pausedText: 'Your staring counter is paused'
}

export default class YouHaveBeenStaring extends Plugin {
    settings: YouHaveBeenStaringSettings;
    staringTimeStatusBar: HTMLElement;
    totalStaringTimeStatusBar: HTMLElement;
    counterActive: boolean

    async onload() {
        await this.loadSettings();
        this.settings.lastLoad = Date.now();
        this.settings.currentSessionDuration = 0;
        this.counterActive = true;

        this.staringTimeStatusBar = this.addStatusBarItem();
        this.totalStaringTimeStatusBar = this.addStatusBarItem();

        this.registerInterval(window.setInterval(() => 
            {
                this.showTimeSinceLoad(),
                this.showTotalStaringTime(),
                this.settings.totalUptime += this.counterActive ? 1000 : 0,
                this.settings.currentSessionDuration += this.counterActive ? 1000 : 0,
                this.saveSettings()
            }, 
                1000
        ));

        this.addSettingTab(new YouHaveBeenStaringSettingsTab(this.app, this));

        this.addRibbonIcon('any-key',  'Start/stop staring counter', () => {
            this.counterActive = !this.counterActive;
            new Notice('Turning staring counter ' + (this.counterActive ? 'on' : 'off'));
		});
    }

    showTimeSinceLoad(): void {
        if(this.settings.lastLoad && this.counterActive) {
            let moment = (window as any).moment;
            let staringTime = moment.duration(this.settings.currentSessionDuration, "milliseconds").humanize();
            this.staringTimeStatusBar.setText(this.settings.staringText + `${staringTime}`);
        }

        if(!this.counterActive) {
            this.staringTimeStatusBar.setText(this.settings.pausedText);
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
                        if(!value) {
                            this.plugin.totalStaringTimeStatusBar.empty();
                        }
                        this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Status bar text of staring time')
            .setDesc('Overrides the status bar text displaying your staring time.')
            .addTextArea((text) =>
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
            .addTextArea((text) =>
                    text
                        .setValue(this.plugin.settings.totalStaringText)
                        .setPlaceholder('Your total staring time in this vault is ')
                        .onChange((value) => {
                            this.plugin.settings.totalStaringText = value;
                            this.plugin.saveSettings();
                        })
            );

        new Setting(containerEl)
            .setName('Status bar text when staring counter is paused')
            .setDesc('Overrides the status bar text shown when you disabled the staring time counting.')
            .addTextArea((text) =>
                    text
                        .setValue(this.plugin.settings.pausedText)
                        .setPlaceholder('Your staring counter is paused')
                        .onChange((value) => {
                            this.plugin.settings.pausedText = value;
                            this.plugin.saveSettings();
                        })
            );
    }
}


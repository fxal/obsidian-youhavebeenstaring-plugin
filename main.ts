import { App, Modal, Notice, Plugin, PluginSettingTab, Setting} from 'obsidian';

interface YouHaveBeenStaringSettings {
    totalUptime: number;
    lastLoad: number;
    showTotalUptimeInStatusBar: boolean; // True, if additionally to the uptime of today the total uptime shall be displayed in the status bar
    showUptimeTodaySinceMidnight: boolean; // True, if the status bar shall display the uptime since 0:00 local time today if lastLoad is not today but on previous days, false if it shall use lastLoad as reference
}

const SETTINGS: YouHaveBeenStaringSettings = {
    totalUptime: 0,
    lastLoad: Date.now(),
    showTotalUptimeInStatusBar: false,
    showUptimeTodaySinceMidnight: false
}

export default class YouHaveBeenStaring extends Plugin {
    settings: YouHaveBeenStaringSettings;
    statusBarItem: HTMLElement;

    async onload() {
        await this.loadSettings();
        this.settings.lastLoad = Date.now();
        await this.saveSettings();

        this.statusBarItem = this.addStatusBarItem();

        this.registerInterval(window.setInterval(() => 
            {
                this.showTimeSinceLoad(),
                this.showTotalStaringTime(),
                this.settings.totalUptime +=1000
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

            this.statusBarItem.setText(`You have been staring at your vault for ${from}`);
        }
    }

    showTotalStaringTime(): void {
        if(this.settings.showTotalUptimeInStatusBar && this.settings.totalUptime > 0) {
            let moment = (window as any).moment;
            let totalStaringTime = moment.duration(this.settings.totalUptime, "milliseconds").humanize();
            this.statusBarItem.setText(`Your total staring time in this vault is ${totalStaringTime}`);
        }
    }

    show(): void {
        this.showTimeSinceLoad();
        if(this.settings.showTotalUptimeInStatusBar) {

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
	}
}


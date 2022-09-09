import { getInstalledCommunityNodes, installNewPackage, uninstallPackage, updatePackage } from "@/api/communityNodes";
import { getAvailableCommunityPackageCount } from "@/api/settings";
import { defineStore } from "pinia";
import { useRootStore } from "./rootN8nStore";
import { PublicInstalledPackage } from 'n8n-workflow';
import Vue from "vue";
import { ICommunityPackageMap } from "@/Interface";

const LOADER_DELAY = 300;

interface ICommunityNodesState {
	availablePackageCount: number;
	installedPackages: { [name: string]: PublicInstalledPackage };
}

export const useCommunityNodesStore = defineStore('communityNodes', {
	state: (): ICommunityNodesState => ({
		// -1 means that package count has not been fetched yet
		availablePackageCount: -1,
		installedPackages: {},
	}),
	getters: {
		getInstalledPackages: (state) => {
			return Object.values(state.installedPackages).sort((a, b) => a.packageName.localeCompare(b.packageName));
		},
		getInstalledPackageByName: (state) => {
			return (name: string): PublicInstalledPackage => state.installedPackages[name];
		},
	},
	actions: {
		async fetchAvailableCommunityPackageCount(): Promise<void> {
			if (this.availablePackageCount === -1) {
				this.availablePackageCount = await getAvailableCommunityPackageCount();
			}
		},
		async fetchInstalledPackages(): Promise<void> {
			const rootStore = useRootStore();
			const installedPackages = await getInstalledCommunityNodes(rootStore.getRestApiContext);
			this.setInstalledPackages(installedPackages);
			const timeout = installedPackages.length > 0 ? 0: LOADER_DELAY;
			setTimeout(() => {
			}, timeout);
		},
		async installPackage(packageName: string): Promise<void> {
			try {
				const rootStore = useRootStore();
				await installNewPackage(rootStore.getRestApiContext, packageName);
				await this.fetchInstalledPackages();
			} catch (error) {
				throw (error);
			}
		},
		async uninstallPackage(packageName: string): Promise<void> {
			try {
				const rootStore = useRootStore();
				await uninstallPackage(rootStore.getRestApiContext, packageName);
				this.removePackageByName(packageName);
			} catch (error) {
				throw (error);
			}
		},
		async updatePackage(packageName: string): Promise<void> {
			try {
				const rootStore = useRootStore();
				const packageToUpdate: PublicInstalledPackage = this.getInstalledPackageByName(packageName);
				const updatedPackage: PublicInstalledPackage = await updatePackage(rootStore.getRestApiContext, packageToUpdate.packageName);
				this.updatePackageObject(updatedPackage);
			} catch (error) {
				throw (error);
			}
		},
		setInstalledPackages(packages: PublicInstalledPackage[]) {
			this.installedPackages = packages.reduce((packageMap: ICommunityPackageMap, pack: PublicInstalledPackage) => {
				packageMap[pack.packageName] = pack;
				return packageMap;
			}, {});
		},
		removePackageByName(name: string): void {
			Vue.delete(this.installedPackages, name);
		},
		updatePackageObject(newPackage: PublicInstalledPackage) {
			this.installedPackages[newPackage.packageName] = newPackage;
		},
	},
});

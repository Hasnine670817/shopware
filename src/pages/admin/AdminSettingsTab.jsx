const AdminSettingsTab = () => (
  <article className="rounded-2xl border border-[#e7e9ef] bg-white p-5 shadow-sm md:p-6">
    <h2 className="text-lg font-semibold text-[#202734]">Settings</h2>
    <div className="mt-5 space-y-4">
      <label className="flex items-center justify-between rounded-xl border border-[#eceff3] p-4">
        <span className="text-sm text-[#202734]">Email notifications</span>
        <input type="checkbox" className="toggle toggle-sm" defaultChecked />
      </label>
      <label className="flex items-center justify-between rounded-xl border border-[#eceff3] p-4">
        <span className="text-sm text-[#202734]">Low stock alerts</span>
        <input type="checkbox" className="toggle toggle-sm" defaultChecked />
      </label>
      <button className="btn btn-neutral bg-[#202734] text-white hover:bg-[#202734]/90">
        Save Settings
      </button>
    </div>
  </article>
)

export default AdminSettingsTab

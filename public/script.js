const { format } = dateFns
const socket = io.connect('http://deploy.zhuhaolin.com:3000')

new Vue({
  el: '#app',
  data: {
    activeTab: 'app',
    commits: [],
    page: 1,
    logs: '',
    error: '',
    buildDidalogTitle: '',
    buildDialogVisible: false,
    isFetching: false,
    isFetchingLog: false,
    isPublishing: false,
  },
  computed: {
    filteredCommits() {
      return this.commits.map(item => {
        return {
          ...item,
          commit_id: item.commit_id.substr(0, 8),
          committer: `${item.committer_name} <${item.committer_email}>`,
          committedAt: format(item.committedAt, 'YYYY-MM-DD HH:mm:ss'),
          builds: item.build_id
        }
      })
    }
  },
  methods: {
    async fetchList() {
      const limit = 30
      const offset = (this.page - 1) * 30

      this.isFetching = true
      const res = await axios.get(`/commits?repo=${this.activeTab}&limit=${limit}&offset=${offset}`)
      this.commits = res.data
      this.isFetching = false
    },
    handleTabClick(tab, event) {
      this.page = 1
      this.fetchList()
    },
    handleBuild(id) {
      this.buildDidalogTitle = 'Commit Building...'
      this.buildDialogVisible = true
      socket.emit('build', { id })
    },
    async handleLog(build) {
      try {
        this.buildDidalogTitle = 'Build Log'
        this.buildDialogVisible = true
        this.isFetchingLog = true

        const res = await axios.get(`/builds/${build._id}/log`)
        if (!res.data) {
          throw new Error('No Log!')
        }

        this.logs = res.data.contents
        this.isFetchingLog = false
      } catch (error) {
        this.$message.error(error.message)
      }
    },
    async handlePublish(id) {
      try {
        this.isPublishing = true
        await axios.post(`/commits/${id}/publish`)
        this.isPublishing = false
        this.fetchList()
      } catch (error) {
        this.$message.error(error.message)
        this.isPublishing = false
      }
    }
  },
  mounted() {
    this.fetchList()

    socket.on('log', log => {
      this.logs = log
    })

    socket.on('err', error => {
      this.error = error
    })

    socket.on('finish', () => {
      this.buildDialogVisible = false
      this.fetchList()
    })
  }
})

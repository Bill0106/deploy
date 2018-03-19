const { format } = dateFns
const socket = io.connect('http://127.0.0.1:3000')

new Vue({
  el: '#app',
  data: {
    commits: [],
    page: 1,
    logs: '',
    error: '',
    buildDidalogTitle: 'Commit Building...',
    buildDialogVisible: false,
    isFetching: false,
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
      const commits = await axios.get(`/commits?repo=admin&limit=${limit}&offset=${offset}`)
      this.commits = commits.data
      this.isFetching = false
    },
    handleBuild(id) {
      this.buildDialogVisible = true
      socket.emit('build', { id })
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

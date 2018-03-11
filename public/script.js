var app = new Vue({
  el: '#app',
  data: {
    commits: [],
    page: 1,
    isFetching: false,
  },
  computed: {
    filteredCommits() {
      return this.commits.map(item => {
        return {
          ...item,
          commit_id: item.commit_id.substr(0, 8),
          committer: `${item.committer_name} <${item.committer_email}>`,
          committedAt: moment(item.committedAt).format('YYYY-MM-DD HH:mm:ss'),
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
    }
  },
  mounted() {
    this.fetchList()
  }
})
